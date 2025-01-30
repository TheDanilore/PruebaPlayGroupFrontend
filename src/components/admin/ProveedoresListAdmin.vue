<script>
import AdminMenu from './AdminMenu.vue'
import ProveedoresForm from './ProveedoresForm.vue'
import axios from 'axios'

export default {
  components: {
    AdminMenu,
    ProveedoresForm,
  },
  data() {
    return {
      error: null,
      proveedores: [], // Array para los proveedores
      mostrarFormulario: false,
      proveedorEditado: null,
      totalPages: 1,
      perPage: 5, //valor predeterminado para perPage
    }
  },
  methods: {
    async obtenerProveedores(page = 1) {
      try {
        const response = await axios.get(`/api/proveedores?page=${page}&per_page=${this.perPage}`)

        // Asignar las  desde la respuesta de la API
        this.proveedores = response.data.data

        // Asignar las propiedades de paginación
        this.currentPage = response.data.current_page
        this.totalPages = response.data.last_page
      } catch (error) {
        console.error('Error al obtener las proveedores:', error)
      }
    },
    cambiarPagina(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.obtenerProveedores(page)
      }
    },
    mostrarFormularioCreacion() {
      this.proveedorEditado = null
      this.mostrarFormulario = true
    },
    editarProveedor(proveedor) {
      this.proveedorEditado = { ...proveedor }
      this.mostrarFormulario = true
    },
    async onGuardar() {
      // Este método ahora solo maneja la actualización de la lista y cierre del formulario
      await this.obtenerProveedores()
      this.cerrarFormulario()
    },
    async eliminarProveedor(id) {
      if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
        try {
          await axios.delete(`/api/proveedores/${id}`)
          this.obtenerProveedores()
        } catch (error) {
          console.error(
            'Error al eliminar el permiso:',
            error.response ? error.response.data : error.message,
          )
        }
      }
    },
    cerrarFormulario() {
      this.mostrarFormulario = false
      this.proveedorEditado = null
    },
  },

  //cargar listas
  mounted() {
    this.obtenerProveedores()
  },
}
</script>

<template>
  <div class="container mt-0">
    <AdminMenu />
    <br />
    <h2 class="mb-4 text-center">Lista de Proveedores</h2>
    <div class="table-responsive">
      <table class="table table-striped table-bordered text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>RUC</th>
            <th>Razon Social</th>
            <th>Dirección</th>
            <th>Telélefono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proveedor in proveedores" :key="proveedor.id">
            <td>{{ proveedor.id }}</td>
            <td>{{ proveedor.ruc }}</td>
            <td>{{ proveedor.razon_social }}</td>
            <td>{{ proveedor.direccion }}</td>
            <td>{{ proveedor.telefono }}</td>
            <td>
              <span v-if="proveedor.estado === 'ACTIVO'" class="badge bg-success">ACTIVO</span>
              <span v-else class="badge bg-danger">INACTIVO</span>
            </td>
            <td>
              <button @click="editarProveedor(proveedor)" class="btn btn-primary btn-sm">
                Editar
              </button>
              <button @click="eliminarCategoria(proveedor.id)" class="btn btn-danger btn-sm">
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
      <select v-model="perPage" @change="obtenerProveedores" id="perPage" class="form-select">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>

    <div class="mt-4 text-center">
      <button @click="mostrarFormularioCreacion" class="btn btn-success">
        Añadir Nuevo Proveedor
      </button>
    </div>

    <!-- Formulario para crear/editar permiso -->
    <ProveedoresForm v-if="mostrarFormulario" :proveedorEditado="proveedorEditado" @guardar="onGuardar"
      @cerrar="cerrarFormulario" />
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  /* Centra todo el contenido dentro del contenedor */
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.form-container {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.table {
  margin-top: 1.5rem;
}

.table th,
.table td {
  vertical-align: middle;
  text-align: center;
  /* Centra el contenido de las celdas */
}

.btn {
  margin: 0 5px;
  /* Espacio entre los botones */
}

.mt-4 {
  margin-top: 1.5rem;
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
