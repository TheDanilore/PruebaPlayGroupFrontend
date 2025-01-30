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
      categorias: [],
      unidadesMedida: [],
      ubicaciones: [],
      proveedores: [],
      colores: [],
      tamanos: [],
      longitudes: [],
      mostrarFormulario: false,
      productoEditado: null,
      activeIndex: {},
      loading: false,
      error: null,
    }
  },
  methods: {
    async obtenerProductos() {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get('/api/productos')
        this.productos = data.data.map((producto) => ({
          ...producto,
          inventario: [],
          opcionesUnicas: { colores: [], tamanos: [], longitudes: [] },
        }))

        await this.obtenerInventarios()
      } catch (error) {
        console.error('Error al obtener los productos:', error)
        this.error = 'Error al obtener los productos. Inténtelo de nuevo más tarde.'
      } finally {
        this.loading = false
      }
    },

    async obtenerInventarios() {
      if (!this.productos.length) return
      try {
        const productosIds = this.productos.map((p) => p.id)
        const { data: inventarios } = await axios.get('/api/inventario', {
          params: { productos: productosIds },
        })

        this.productos.forEach((producto) => {
          producto.inventario = inventarios.filter((inv) => inv.producto_id === producto.id)

          producto.opcionesUnicas = {
            colores: [
              ...new Set(producto.inventario.map((item) => item.variacion?.color?.descripcion)),
            ].filter(Boolean),
            tamanos: [
              ...new Set(producto.inventario.map((item) => item.variacion?.tamano?.descripcion)),
            ].filter(Boolean),
            longitudes: [
              ...new Set(producto.inventario.map((item) => item.variacion?.longitud?.descripcion)),
            ].filter(Boolean),
          }
        })
      } catch (error) {
        console.error('Error al obtener inventario:', error)
      }
    },

    async obtenerOpciones() {
      await Promise.all([
        this.obtenerCategorias(),
        this.obtenerUnidadesMedida(),
        this.obtenerUbicaciones(),
        this.obtenerProveedores(),
      ])
    },
    async obtenerCategorias() {
      try {
        const { data } = await axios.get('/api/categoriaproductos')
        this.categorias = data
      } catch (error) {
        console.error('Error al obtener categorías:', error)
      }
    },
    async obtenerUnidadesMedida() {
      try {
        const { data } = await axios.get('/api/unidadesmedidas')
        this.unidadesMedida = data
      } catch (error) {
        console.error('Error al obtener unidades de medida:', error)
      }
    },
    async obtenerProveedores() {
      try {
        const { data } = await axios.get('/api/proveedores')
        this.proveedores = data
      } catch (error) {
        console.error('Error al obtener proveedores:', error)
      }
    },
    async obtenerUbicaciones() {
      try {
        const { data } = await axios.get('/api/ubicaciones')
        this.ubicaciones = data
      } catch (error) {
        console.error('Error al obtener ubicaciones:', error)
      }
    },

    nextImage(productoId) {
      this.activeIndex[productoId] =
        (this.activeIndex[productoId] + 1) %
        (this.productos.find((p) => p.id === productoId)?.imagenes.length || 1)
    },
    prevImage(productoId) {
      this.activeIndex[productoId] =
        (this.activeIndex[productoId] -
          1 +
          (this.productos.find((p) => p.id === productoId)?.imagenes.length || 1)) %
        (this.productos.find((p) => p.id === productoId)?.imagenes.length || 1)
    },

    mostrarFormularioCreacion() {
      this.productoEditado = null
      this.mostrarFormulario = true
    },
    mostrarFormularioEdicion(producto) {
      this.productoEditado = { ...producto }
      this.mostrarFormulario = true
    },
    async onGuardar() {
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

  mounted() {
    this.obtenerProductos()
    this.obtenerOpciones()
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
                <span
                  v-for="colorId in getInventarioAtributos(producto.id).colores"
                  :key="colorId"
                  class="badge bg-secondary me-1"
                >
                  {{ getColorDescripcion(colorId) }}
                </span>
              </template>
              <span v-else>-</span>
            </td>
            <td>
              <template v-if="getInventarioAtributos(producto.id).longitudes.length">
                <span
                  v-for="longitudId in getInventarioAtributos(producto.id).longitudes"
                  :key="longitudId"
                  class="badge bg-secondary me-1"
                >
                  {{ getLongitudDescripcion(longitudId) }}
                </span>
              </template>
              <span v-else>-</span>
            </td>
            <td>
              <template v-if="getInventarioAtributos(producto.id).tamanos.length">
                <span
                  v-for="tamanoId in getInventarioAtributos(producto.id).tamanos"
                  :key="tamanoId"
                  class="badge bg-info me-1"
                >
                  {{ getTamanoDescripcion(tamanoId) }}
                </span>
              </template>
              <span v-else>-</span>
            </td>
            <td>{{ producto.unidad_medida.descripcion }}</td>
            <td>{{ producto.proveedor.razon_social }}</td>
            <td>S/{{ producto.precio_unitario_maximo.toFixed(2) || 0 }}</td>
            <td>
              <template v-if="producto.total_stock >= 500">
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
                  <img
                    :src="`http://localhost:8080/${producto.imagenes[activeIndex[producto.id]]?.url}`"
                    class="d-block w-100"
                    alt="Imagen del producto"
                    style="max-height: 100px; object-fit: cover"
                  />
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
    </div>
    <div class="mt-4 text-center">
      <button @click="mostrarFormularioCreacion" class="btn btn-success">
        Añadir Nuevo Producto
      </button>
    </div>

    <!-- Formulario para crear/editar producto -->
    <ProductoForm
      v-if="mostrarFormulario"
      :productoEditado="productoEditado"
      :categorias="categorias"
      :unidades-medida="unidadesMedida"
      :ubicaciones="ubicaciones"
      :proveedores="proveedores"
      :colores="colores"
      :tamanos="tamanos"
      :longitudes="longitudes"
      @guardar="onGuardar"
      @cerrar="cerrarFormulario"
    />
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
</style>
