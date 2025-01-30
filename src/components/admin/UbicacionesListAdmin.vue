<script>
import AdminMenu from './AdminMenu.vue';
import UbicacionesForm from './UbicacionesForm.vue';
import axios from 'axios';

export default {
  components: {
    AdminMenu,
    UbicacionesForm,
  },
  data() {
    return {
      error: null,
      ubicaciones: [],
      mostrarFormulario: false,
      ubicacionEditado: null,
      totalPages: 1,
      perPage: 5, //valor predeterminado para perPage
    };
  },
  methods: {
    async obtenerUbicaciones(page = 1) {
      try {
        const response = await axios.get(`/api/ubicaciones?page=${page}&per_page=${this.perPage}`)

        // Asignar las  desde la respuesta de la API
        this.ubicaciones = response.data.data

        // Asignar las propiedades de paginación
        this.currentPage = response.data.current_page
        this.totalPages = response.data.last_page
      } catch (error) {
        console.error('Error al obtener las ubicaciones:', error);
      }
    },
    cambiarPagina(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.obtenerUbicaciones(page)
      }
    },
    mostrarFormularioCreacion() {
      this.ubicacionEditado = null;
      this.mostrarFormulario = true;
    },
    editarUbicacion(ubicacion) {
      this.ubicacionEditado = { ...ubicacion };
      this.mostrarFormulario = true;
    },
    async onGuardar() {
      // Este método ahora solo maneja la actualización de la lista y cierre del formulario
      await this.obtenerUbicaciones();
      this.cerrarFormulario();
    },
    async eliminarUbicacion(id) {
      if (confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
        try {
          await axios.delete(`/api/ubicaciones/${id}`);
          this.obtenerProveedores();
        } catch (error) {
          console.error('Error al eliminar la ubicación:', error.response ? error.response.data : error.message);
        }
      }
    },
    cerrarFormulario() {
      this.mostrarFormulario = false;
      this.ubicacionEditado = null;
    },
  },

  //cargar listas
  mounted() {
    this.obtenerUbicaciones();
  }
};
</script>

<template>
  <div class="container mt-0">
    <AdminMenu />
    <br>
    <h2 class="mb-4 text-center">Lista de Ubicaciones</h2>
    <div class="table-responsive">
      <table class="table table-striped table-bordered text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Código</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ubicacion in ubicaciones" :key="ubicacion.id">
            <td>{{ ubicacion.id }}</td>
            <td>{{ ubicacion.descripcion }}</td>
            <td>{{ ubicacion.codigo }}</td>
            <td>
              <button @click="editarUbicacion(ubicacion)" class="btn btn-primary btn-sm">Editar</button>
              <button @click="eliminarUnidad(ubicacion.id)" class="btn btn-danger btn-sm">Eliminar</button>
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
      <select v-model="perPage" @change="obtenerColores" id="perPage" class="form-select">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>

    <div class="mt-4 text-center">
      <button @click="mostrarFormularioCreacion" class="btn btn-success">Añadir Nueva Ubicación</button>
    </div>


    <!-- Formulario para crear/editar tamaño -->
    <UbicacionesForm v-if="mostrarFormulario" :ubicacionEditado="ubicacionEditado" @guardar="onGuardar"
      @cerrar="cerrarFormulario" />

  </div>
</template>



<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
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
