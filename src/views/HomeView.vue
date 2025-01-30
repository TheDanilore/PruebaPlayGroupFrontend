<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categoriaproductos')
    categories.value = response.data
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

const promotions = ref([
  {
    id: 1,
    title: '¡Ofertas de Temporada!',
    description: 'Hasta 40% de descuento en productos seleccionados',
    buttonText: 'Ver Ofertas',
    class: 'bg-primary',
    link: '/ofertas',
  },
  {
    id: 2,
    title: 'Nuevas Llegadas',
    description: 'Descubre las últimas tendencias',
    buttonText: 'Explorar',
    class: 'bg-success',
    link: '/nuevas-llegadas',
  },
])

const navegarACategoria = (categoria) => {
  if (categoria && categoria.descripcion) {
    router.push(`/productos?categoria=${categoria.id}`)
  }
}

const navegarABanner = (link) => {
  router.push(link)
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold">Bienvenido a Nuestra Tienda Online</h1>
          <p class="lead">Descubre productos de calidad a precios competitivos</p>
        </div>

        <!-- Promotional Banners -->
        <div class="row g-4">
          <div v-for="promo in promotions" :key="promo.id" class="col-md-6">
            <div :class="['promo-card', promo.class]">
              <h3 class="promo-title">{{ promo.title }}</h3>
              <p class="promo-description">{{ promo.description }}</p>
              <button @click="navegarABanner(promo.link)" class="btn btn-light rounded-pill">
                {{ promo.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section py-5">
      <div class="container">
        <h2 class="section-title mb-4">Categorías</h2>
        <div class="row g-4">
          <div v-for="category in categories" :key="category.id" class="col-6 col-md-3">
            <div
              class="category-card"
              @click="category.descripcion ? navegarACategoria(category) : null"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <h3 class="category-title">{{ category.descripcion }}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero-section {
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

/* Promotional Cards */
.promo-card {
  padding: 2rem;
  border-radius: 1rem;
  color: white;
  transition: transform 0.3s ease;
}

.promo-card:hover {
  transform: translateY(-5px);
}

.promo-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.promo-description {
  margin-bottom: 1.5rem;
}

/* Product Cards */
.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  height: 100%;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.carousel-control:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-control.prev {
  left: 10px;
}

.carousel-control.next {
  right: 10px;
}

.image-counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
}

.product-info {
  padding: 1.5rem;
}

.product-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

/* Category Cards */
.category-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.category-title {
  font-size: 1.25rem;
  margin: 0;
  color: #333;
}
</style>
