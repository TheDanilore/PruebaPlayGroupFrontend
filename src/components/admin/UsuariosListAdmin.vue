<script>
import AdminMenu from './AdminMenu.vue'
import axios from 'axios'
import UsuariosForm from './UsuariosForm.vue'

export default {
  components: {
    AdminMenu,
    UsuariosForm,
  },
  data() {
    return {
      roles: [],
      isDragging: false, // estado para controlar el arrastre
      error: null,
      usuarios: [], // Array para los proveedores
      mostrarFormulario: false,
      usuarioEditado: null,
      totalPages: 1,
      perPage: 5, //valor predeterminado para perPage
    }
  },
  methods: {
    async obtenerUsuarios(page = 1) {
      try {
        const response = await axios.get(`/api/usuarios?page=${page}&per_page=${this.perPage}`)

        // Asignar las  desde la respuesta de la API
        this.usuarios = response.data.data

        // Asignar las propiedades de paginación
        this.currentPage = response.data.current_page
        this.totalPages = response.data.last_page
      } catch (error) {
        console.error('Error al obtener los usuarios:', error)
      }
    },
    cambiarPagina(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.obtenerUsuarios(page)
      }
    },
    async obtenerRoles() {
      try {
        const response = await axios.get('/api/roles')
        this.roles = response.data
      } catch (error) {
        console.error('Error al obtener roles:', error)
      }
    },

    mostrarFormularioCreacion() {
      this.usuarioEditado = null
      this.mostrarFormulario = true
    },
    editarUsuario(usuario) {
      // Asegurarse de que los roles estén en el formato correcto
      this.usuarioEditado = {
        ...usuario,
        roles: usuario.roles.map((rol) => rol.name), // Asegurarse de que solo pasamos los nombres
      }
      this.mostrarFormulario = true
    },
    async onGuardar() {
      // Este método ahora solo maneja la actualización de la lista y cierre del formulario
      await this.obtenerUsuarios()
      this.cerrarFormulario()
    },
    async eliminarUsuario(id) {
      if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        try {
          await axios.delete(`/api/usuarios/${id}`)
          this.obtenerUsuarios()
        } catch (error) {
          console.error('Error al eliminar el usuario:', error)
        }
      }
    },
    cerrarFormulario() {
      this.mostrarFormulario = false
      this.usuarioEditado = null
    },
  },

  //cargar listas
  mounted() {
    this.obtenerUsuarios()
    this.obtenerRoles()
  },
}
</script>
<template>
  <div class="container mt-0">
    <AdminMenu />
    <br />
    <h2 class="mb-4 text-center">Lista de Usuarios</h2>
    <div class="table-responsive">
      <table class="table table-striped table-bordered text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Avatar</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.id }}</td>
            <td>{{ usuario.name }}</td>
            <td>{{ usuario.email }}</td>
            <td>
              <span v-for="(rol, index) in usuario.roles" :key="rol.id">
                {{ rol.name }}<span v-if="index < usuario.roles.length - 1">, </span>
              </span>
            </td>
            <td>
              <img :src="`http://127.0.0.1:8080/storage/${usuario.avatar}`" alt="Avatar" class="rounded-circle"
                width="80" height="80" />
            </td>
            <td>
              <span v-if="usuario.estado === 'ACTIVO'" class="badge bg-success">ACTIVO</span>
              <span v-else class="badge bg-danger">INACTIVO</span>
            </td>
            <td>
              <button @click="editarUsuario(usuario)" class="btn btn-primary btn-sm">Editar</button>
              <button @click="eliminarUsuario(usuario.id)" class="btn btn-danger btn-sm">
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
      <select v-model="perPage" @change="obtenerUsuarios" id="perPage" class="form-select">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>

    <div class="mt-4 text-center">
      <button @click="mostrarFormularioCreacion" class="btn btn-success">
        Añadir Nuevo Usuario
      </button>
    </div>

    <!-- Formulario para crear/editar tamaño -->
    <UsuariosForm v-if="mostrarFormulario" :usuarioEditado="usuarioEditado" @guardar="onGuardar"
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

.drop-area {
  border: 2px dashed #007bff;
  border-radius: 5px;
  padding: 20px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s;
  margin-top: 5px;
}

.drop-area.highlight {
  background-color: rgba(0, 123, 255, 0.1);
  /* Color de fondo al arrastrar */
}

.preview {
  max-width: 150px;
  /* Cambia este valor para ajustar el tamaño */
  max-height: 150px;
  /* Cambia este valor para ajustar el tamaño */
  border-radius: 50%;
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
