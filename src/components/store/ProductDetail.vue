<script>
export default {
  data() {
    return {
      loading: true,
      error: null,
      product: null,
      selectedImage: null,
      selectedPrice: null,
      hasStock: false,
      availableStock: 0,
      availableColors: [],
      selectedColor: null,
      availableSizes: [],
      selectedSize: null,
      availableLongitudes: [],
      selectedLongitud: null,
      quantity: 1,
      validationMessage: '',
    }
  },
  mounted() {
    this.fetchProductDetails()
  },
  methods: {
    async fetchProductDetails() {
      try {
        // Simulando la llamada a la API
        const response = await fetch('/api/productos/5') // Reemplaza con la URL correcta
        const data = await response.json()
        this.product = data
        this.selectedPrice = data.precio_unitario
        this.availableStock = data.stock
        this.hasStock = data.stock > 0

        // Procesamos las variantes (colores, tamaños y longitudes)
        this.availableColors = data.colores.filter((color) => color !== null)
        this.availableSizes = data.tamanos.filter((tamano) => tamano !== null)
        this.availableLongitudes = data.longitudes.filter((longitud) => longitud !== null)

        // Seleccionar el primer valor por defecto
        if (this.availableColors.length > 0) this.selectedColor = this.availableColors[0].id
        if (this.availableSizes.length > 0) this.selectedSize = this.availableSizes[0].id
        if (this.availableLongitudes.length > 0)
          this.selectedLongitud = this.availableLongitudes[0].id

        this.selectedImage = data.imagenes.length > 0 ? data.imagenes[0].url : null

        this.loading = false
      } catch (error) {
        this.error = 'Error al cargar los detalles del producto' + error
        this.loading = false
      }
    },

    handleColorSelect(colorId) {
      this.selectedColor = colorId
      this.updatePrice()
    },

    handleSizeSelect(sizeId) {
      this.selectedSize = sizeId
      this.updatePrice()
    },

    handleLongitudSelect(longitudId) {
      this.selectedLongitud = longitudId
      this.updatePrice()
    },

    updatePrice() {
      if (!this.selectedColor || !this.selectedSize || !this.selectedLongitud) return

      // Suponiendo que cada combinación de color, tamaño y longitud tiene un precio unitario diferente
      const selectedInventory = this.product.inventario.find(
        (inventario) => inventario.variacion_id === this.getVariationId(),
      )

      if (selectedInventory) {
        this.selectedPrice = selectedInventory.precio_unitario
      }
    },

    getVariationId() {
      // Lógica para obtener el ID de variación según color, tamaño y longitud seleccionados
      return `${this.selectedColor}-${this.selectedSize}-${this.selectedLongitud}`
    },

    prevImage() {
      const currentIndex = this.product.imagenes.findIndex(
        (imagen) => imagen.url === this.selectedImage,
      )
      const prevIndex =
        (currentIndex - 1 + this.product.imagenes.length) % this.product.imagenes.length
      this.selectedImage = this.product.imagenes[prevIndex].url
    },

    nextImage() {
      const currentIndex = this.product.imagenes.findIndex(
        (imagen) => imagen.url === this.selectedImage,
      )
      const nextIndex = (currentIndex + 1) % this.product.imagenes.length
      this.selectedImage = this.product.imagenes[nextIndex].url
    },

    validateAndUpdateQuantity() {
      if (this.quantity <= 0) {
        this.validationMessage = 'La cantidad debe ser al menos 1'
      } else if (this.quantity > this.availableStock) {
        this.validationMessage = `La cantidad máxima disponible es ${this.availableStock}`
      } else {
        this.validationMessage = ''
      }
    },

    addToCart() {
      // Lógica para añadir al carrito
      alert('Producto añadido al carrito')
    },
  },
}
</script>

<template>
  <div class="product-detail">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="product" class="row">
      <!-- Columna de imágenes -->
      <div class="col-md-6">
        <div class="image-gallery">
          <div class="main-image position-relative">
            <img
              :src="`http://localhost:8000/${selectedImage}`"
              :alt="product.nombre"
              class="img-fluid"
              @mousemove="updateZoomPosition"
            />
            <div class="navigation-arrows">
              <button
                class="btn btn-light position-absolute start-0 top-50 translate-middle-y"
                @click="prevImage"
                v-if="product.imagenes.length > 1"
              >
                ❮
              </button>
              <button
                class="btn btn-light position-absolute end-0 top-50 translate-middle-y"
                @click="nextImage"
                v-if="product.imagenes.length > 1"
              >
                ❯
              </button>
            </div>
          </div>
          <div class="thumbnail-images d-flex gap-2 mt-3" v-if="product.imagenes.length > 1">
            <img
              v-for="(imagen, index) in product.imagenes"
              :key="index"
              :src="`http://localhost:8000/${imagen.url}`"
              :alt="`${product.nombre} - Vista ${index + 1}`"
              class="thumbnail cursor-pointer"
              :class="{ active: selectedImage === imagen.url }"
              @click="selectedImage = imagen.url"
              style="width: 80px; height: 80px; object-fit: cover"
            />
          </div>
        </div>
      </div>

      <!-- Columna de detalles -->
      <div class="col-md-6">
        <div class="detalle-producto mb-3">
          <h1 class="product-title h2 mb-3">{{ product.nombre }}</h1>
          <p class="product-price h3 text-primary mb-4">S/ {{ selectedPrice }}</p>
          <p class="product-description mb-4">{{ product.descripcion }}</p>

          <!-- Stock disponible -->
          <div :class="['alert', hasStock ? 'alert-success' : 'alert-danger']">
            <i :class="['bi', hasStock ? 'bi-check-circle-fill' : 'bi-x-circle-fill']"></i>
            {{ hasStock ? `Stock disponible: ${availableStock} unidades` : 'Producto agotado' }}
          </div>

          <!-- Selección de colores -->
          <div v-if="availableColors.length" class="mb-4">
            <h4 class="h6 mb-2">Colores disponibles:</h4>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="color in availableColors"
                :key="color.id"
                class="btn btn-outline-secondary"
                :class="{ active: selectedColor === color.id }"
                @click="handleColorSelect(color.id)"
              >
                {{ color.descripcion }}
              </button>
            </div>
          </div>

          <!-- Selección de tamaños -->
          <div v-if="availableSizes.length" class="mb-4">
            <h4 class="h6 mb-2">Tamaños disponibles:</h4>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="tamano in availableSizes"
                :key="tamano.id"
                class="btn btn-outline-secondary"
                :class="{ active: selectedSize === tamano.id }"
                @click="handleSizeSelect(tamano.id)"
              >
                {{ tamano.descripcion }}
              </button>
            </div>
          </div>

          <!-- Selección de Longitudes -->
          <div v-if="availableLongitudes.length" class="mb-4">
            <h4 class="h6 mb-2">Longitudes disponibles:</h4>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="longitud in availableLongitudes"
                :key="longitud.id"
                class="btn btn-outline-secondary"
                :class="{ active: selectedLongitud === longitud.id }"
                @click="handleLongitudSelect(longitud.id)"
              >
                {{ longitud.descripcion }}
              </button>
            </div>
          </div>

          <!-- Control de cantidad -->
          <div class="quantity-control mb-4">
            <label class="h6 mb-2">Cantidad:</label>
            <div class="d-flex align-items-center gap-2">
              <button
                @click="quantity > 1 && quantity--"
                class="btn btn-outline-secondary"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <input
                type="number"
                v-model="quantity"
                @input="validateAndUpdateQuantity"
                min="1"
                :max="Math.min(availableStock, 50)"
                class="form-control text-center"
                style="width: 80px"
              />
              <button
                @click="quantity++"
                class="btn btn-outline-secondary"
                :disabled="quantity >= Math.min(availableStock, 50)"
              >
                +
              </button>
            </div>
          </div>

          <!-- Botón de añadir al carrito -->
          <button
            @click="addToCart"
            class="btn btn-primary btn-lg w-100 mb-2"
            :disabled="!selectedColor || !selectedSize || !selectedLongitud || quantity <= 0"
          >
            <i class="bi bi-cart-plus"></i> Añadir al Carrito
          </button>

          <!-- Mensaje de validación -->
          <p v-if="validationMessage" class="text-danger small text-center">
            {{ validationMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-image {
  overflow: hidden;
  cursor: zoom-in;
  max-width: 80%;
}

.main-image img {
  transition: transform 0.3s ease;
}

.main-image:hover img {
  transform: scale(1.5);
}

.thumbnail {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.thumbnail:hover {
  opacity: 0.8;
}

.thumbnail.active {
  border: 2px solid var(--bs-primary);
}

.navigation-arrows button {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.navigation-arrows button:hover {
  opacity: 1;
}

.btn.active {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
}

.product-detail {
  max-width: auto;
  margin: 0.5rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.image-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thumbnail-images {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.thumbnail-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  margin: 0 5px;
  cursor: pointer;
  border: 2px solid transparent;
  transition:
    border-color 0.3s,
    transform 0.3s;
}

.thumbnail-image:hover {
  transform: scale(1.1);
}

.thumbnail-image.active {
  border-color: #ff5c5c;
}

.displayed-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.3s ease;
  transform-origin: var(--mouse-x) var(--mouse-y);
}

/* Flechas de navegación, inicialmente ocultas */
.navigation-arrows {
  position: absolute;
  top: 50%;
  width: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

/* Mostrar flechas al pasar el cursor */
.main-image:hover .navigation-arrows {
  opacity: 1;
}

.arrow {
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  font-size: 20px;
  transition: background-color 0.3s;
}

.arrow:hover {
  background-color: rgba(255, 255, 255, 1);
}

.product-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.product-price {
  font-size: 1.5rem;
  color: #ff5c5c;
  margin-bottom: 20px;
}

.product-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
}

/* Control de cantidad */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.quantity-input {
  width: 50px;
  height: 30px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0 4px;
  padding: 0 4px;
  font-size: 14px;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input:focus {
  outline: none;
  border-color: #666;
}

.quantity {
  font-size: 1.2rem;
  min-width: 60px;
  text-align: center;
}

.btn-primary {
  background-color: #ff5c5c;
  border: none;
  padding: 10px 20px;
}

.btn-primary:hover {
  background-color: #e04a4a;
}

.color-option,
.size-option,
.longitud-option {
  min-width: 40px;
  padding: 0.5rem 1rem;
}

.color-option.active,
.size-option.active,
.longitud-option.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

@media (max-width: 768px) {
  .quantity {
    grid-area: quantity;
  }
}
</style>
