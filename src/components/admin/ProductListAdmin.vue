<script>
import AdminMenu from './AdminMenu.vue'
import ProductoForm from './ProductoForm.vue'
import axios from 'axios'

export default {
  components: {
    AdminMenu,
    ProductoForm,
  },
  data() {
    return {
      productos: [],
      inventarioProductos: {},
      mostrarFormulario: false,
      productoEditado: null,
      activeIndex: {},
      totalPages: 1,
      perPage: 5, //valor predeterminado para perPage
    }
  },
  computed: {
    // Método para obtener el inventario de un producto
    getInventarioAtributos() {
      return (productoId) => this.inventarioProductos[productoId] || {
        colores: [],
        tamanos: [],
        longitudes: [],
      }
    },
  },
  methods: {
    async obtenerProductos(page = 1) {
      try {
        const response = await axios.get(`/api/productos?page=${page}&per_page=${this.perPage}`)

        // Asignar las  desde la respuesta de la API
        // this.productos = response.data.data

        this.productos = response.data.data.map((producto) => {
          return {
            ...producto,
            imagenes: producto.imagenes || [],
          }
        })

        // Asignar las propiedades de paginación
        this.currentPage = response.data.current_page
        this.totalPages = response.data.last_page

        // Obtener el inventario para cada producto
        await Promise.all(
          this.productos.map((producto) => this.obtenerInventarioProducto(producto.id)),
        )

        // Inicializa el índice activo para cada producto
        this.productos.forEach((producto) => {
          this.activeIndex[producto.id] = 0
        })
      } catch (error) {
        console.error('Error al obtener los productos:', error)
      }
    },
    cambiarPagina(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.obtenerProductos(page)
      }
    },
    // método para obtener el inventario específico de un producto
    async obtenerInventarioProducto(productoId) {
      try {
        const response = await axios.get(`/api/inventario/producto/${productoId}`)
        const inventario = response.data

        // Transformar la respuesta en un formato más manejable
        this.inventarioProductos[productoId] = inventario.map((item) => ({
          color: item.variacion?.color || null,
          tamano: item.variacion?.tamano || null,
          longitud: item.variacion?.longitud || null,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        }))
      } catch (error) {
        console.error(`Error al obtener el inventario del producto ${productoId}:`, error)
        this.inventarioProductos[productoId] = []
      }
    },
    getInventarioCantidadYPrecio(productoId, colorId, tamanoId, longitudId) {
      const inventario = this.inventarioProductos[productoId] || []

      const variacion = inventario.find(
        (item) =>
          (colorId ? item.color?.id === colorId : true) &&
          (tamanoId ? item.tamano?.id === tamanoId : true) &&
          (longitudId ? item.longitud?.id === longitudId : true)
      )

      if (variacion) {
        return `${variacion.cantidad} unidades - S/${variacion.precio_unitario.toFixed(2)}`
      }
      return '-'
    },
    // Métodos helper para obtener las descripciones
    getColorDescripcion(colorId) {
      const color = this.colores.find((c) => c.id === colorId)
      return color ? color.descripcion : ''
    },
    getTamanoDescripcion(tamanoId) {
      const tamano = this.tamanos.find((t) => t.id === tamanoId)
      return tamano ? tamano.descripcion : ''
    },
    getLongitudDescripcion(longitudId) {
      const longitud = this.longitudes.find((l) => l.id === longitudId)
      return longitud ? longitud.descripcion : ''
    },


    nextImage(productoId) {
      if (this.productos.length > 0) {
        const producto = this.productos.find((p) => p.id === productoId)
        if (producto) {
          this.activeIndex[productoId] =
            (this.activeIndex[productoId] + 1) % producto.imagenes.length
        }
      }
    },
    prevImage(productoId) {
      if (this.productos.length > 0) {
        const producto = this.productos.find((p) => p.id === productoId)
        if (producto) {
          this.activeIndex[productoId] =
            (this.activeIndex[productoId] - 1 + producto.imagenes.length) % producto.imagenes.length
        }
      }
    },
    // Métodos de gestión del formulario
    mostrarFormularioCreacion() {
      this.productoEditado = null
      this.mostrarFormulario = true
    },
    mostrarFormularioEdicion(producto) {
      this.productoEditado = {
        ...JSON.parse(JSON.stringify(producto)),
        inventario: this.inventarioProductos[producto.id] || [],
      }
      this.mostrarFormulario = true
    },
    async onGuardar() {
      // Este método ahora solo maneja la actualización de la lista y cierre del formulario
      await this.obtenerProductos()
      this.cerrarFormulario()
    },
    async eliminarProducto(id) {
      if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        try {
          await axios.delete(`/api/productos/${id}`)
          await this.obtenerProductos()
        } catch (error) {
          console.error('Error al eliminar el producto:', error)
        }
      }
    },
    cerrarFormulario() {
      this.mostrarFormulario = false
      this.productoEditado = null
    },
  },

  //cargar listas
  mounted() {
    this.obtenerProductos()
  },
}
</script>

<template>
  <div class="container mt-0">
    <AdminMenu />
    <br />
    <h2 class="mb-4 text-center">Lista de Productos</h2>
    <div class="table-responsive">
      <table class="table table-striped table-bordered text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Colores</th>
            <th>Longitudes</th>
            <th>Tamaños</th>
            <th>Unidad de Medida</th>
            <th>Proveedor</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Ubicación</th>
            <th>Imagenes</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.categoria.descripcion }}</td>
            <td>
              <template v-if="getInventarioAtributos(producto.id).colores.length">
                <span v-for="color in getInventarioAtributos(producto.id).colores" :key="color.id">
                  {{ getColorDescripcion(color.id) }}
                </span>
              </template>
              <span v-else>-</span>
            </td>
            <td>
              <template v-if="getInventarioAtributos(producto.id).longitudes.length">
                <span v-for="longitudId in getInventarioAtributos(producto.id).longitudes" :key="longitudId">
                  {{ getLongitudDescripcion(longitudId) }}
                </span>
              </template>
              <span v-else>-</span>
            </td>
            <td>
              <template v-if="getInventarioAtributos(producto.id).tamanos.length">
                <span v-for="tamanoId in getInventarioAtributos(producto.id).tamanos" :key="tamanoId">
                  {{ getTamanoDescripcion(tamanoId) }}
                </span>
              </template>
              <span v-else>-</span>
            </td>
            <td>{{ producto.unidad_medida.descripcion }}</td>
            <td>{{ producto.proveedor.razon_social }}</td>
            <!-- <td> S/{{ producto.precio_unitario_maximo.toFixed(2) || 0 }} </td> -->
            <td></td>
            <td>
              <template v-if="producto.inventario.cantidad >= 500">
                <span class="badge bg-success me-1">
                  {{ producto.total_stock || 0 }}
                </span>
              </template>
              <template v-if="producto.total_stock < 500 && producto.total_stock > 50">
                <span class="badge bg-primary me-1">
                  {{ producto.total_stock || 0 }}
                </span>
              </template>
              <template v-if="producto.total_stock <= 50 && producto.total_stock > 10">
                <span class="badge bg-info me-1">
                  {{ producto.total_stock || 0 }}
                </span>
              </template>
              <template v-if="producto.total_stock <= 10">
                <span class="badge bg-danger me-1">
                  {{ producto.total_stock || 0 }}
                </span>
              </template>
            </td>
            <td>{{ producto.ubicacion.descripcion }}</td>
            <td>
              <div v-if="producto.imagenes.length > 0">
                <div class="carousel-container">
                  <img :src="`http://localhost:8000/${producto.imagenes[activeIndex[producto.id]]?.url}`"
                    class="d-block w-100" alt="Imagen del producto" style="max-height: 100px; object-fit: cover" />
                  <button @click="prevImage(producto.id)" class="carousel-control-prev">◀</button>
                  <button @click="nextImage(producto.id)" class="carousel-control-next">▶</button>
                </div>
              </div>
              <div v-else>
                <p>No hay imágenes disponibles.</p>
              </div>
            </td>
            <td>
              <span v-if="producto.estado === 'ACTIVO'" class="badge bg-success">ACTIVO</span>
              <span v-else class="badge bg-danger">INACTIVO</span>
            </td>
            <td>
              <button @click="mostrarFormularioEdicion(producto)" class="btn btn-primary btn-sm">
                Editar
              </button>
              <button @click="eliminarProducto(producto.id)" class="btn btn-danger btn-sm">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="pagination-container">
        <button @click="cambiarPagina(currentPage - 1)" :disabled="currentPage <= 1" class="pagination-btn">
          Anterior
        </button>
        <span class="pagination-info">Página {{ currentPage }} de {{ totalPages }}</span>
        <button @click="cambiarPagina(currentPage + 1)" :disabled="currentPage >= totalPages" class="pagination-btn">
          Siguiente
        </button>
      </div>
    </div>

    <!-- Selector de Resultados por Página -->
    <div class="mb-3 mt-3">
      <label for="perPage" class="form-label">Resultados por página:</label>
      <select v-model="perPage" @change="obtenerRoles" id="perPage" class="form-select">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>

    <div class="mt-4 text-center">
      <button @click="mostrarFormularioCreacion" class="btn btn-success">
        Añadir Nuevo Producto
      </button>
    </div>

    <!-- Formulario para crear/editar producto -->
    <ProductoForm v-if="mostrarFormulario" :productoEditado="productoEditado" :categorias="categorias"
      :unidades-medida="unidadesMedida" :ubicaciones="ubicaciones" :proveedores="proveedores" :colores="colores"
      :tamanos="tamanos" :longitudes="longitudes" @guardar="onGuardar" @cerrar="cerrarFormulario" />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #343a40;
}

.table-responsive {
  margin-top: 1.5rem;
  overflow-x: auto;
}

td {
  max-width: 200px;
  white-space: normal;
  word-wrap: break-word;
}

.table th,
.table td {
  vertical-align: middle;
  text-align: center;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-container img {
  max-height: 100px;
  object-fit: cover;
}

.carousel-control-prev,
.carousel-control-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  z-index: 10;
}

.carousel-control-prev {
  left: 5px;
}

.carousel-control-next {
  right: 5px;
}

/* Estilos para los botones de paginación */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-btn {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination-btn:hover {
  background-color: #0056b3;
}

.pagination-info {
  font-size: 16px;
  margin: 0 10px;
}

/* Estilo para el selector de resultados por página */
.mb-3 {
  margin-bottom: 15px;
}
</style>
