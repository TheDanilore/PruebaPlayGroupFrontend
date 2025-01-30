<script>
import AdminMenu from './AdminMenu.vue'
import axios from 'axios'

export default {
  components: {
    AdminMenu,
  },
  data() {
    return {
      inventario: [],
      currentPage: 1,
      totalPages: 1,
      perPage: 5, //valor predeterminado para perPage
    }
  },
  methods: {
    async obtenerInventario(page = 1) {
      try {
        const response = await axios.get(`/api/inventario?page=${page}&per_page=${this.perPage}`)

        this.inventario = response.data.data

        this.currentPage = response.data.current_page
        this.totalPages = response.data.last_page
      } catch (error) {
        console.error('Error al cargar el inventario:', error)
      }
    },
    cambiarPagina(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.obtenerInventario(page)
      }
    },
  },
  created() {
    this.obtenerInventario()
  },
}
</script>

<template>
  <div class="container mt-0">
    <AdminMenu />
    <div>
      <h1>Inventario</h1>

      <div class="table-responsive">
        <table class="table table-striped table-bordered text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Color</th>
              <th>Tamaño</th>
              <th>Longitud</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventario" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.producto.nombre }}</td>
              <td>
                <template v-if="item.variacion.color?.descripcion != null">
                  <h6>
                    <span class="badge bg-secondary me-1">
                      {{ item.variacion.color?.descripcion || 'N/A' }}
                    </span>
                  </h6>
                </template>
                <span v-else>-</span>
              </td>
              <td>
                <template v-if="item.variacion.tamano?.descripcion != null">
                  <h6>
                    <span class="badge bg-info me-1">
                      {{ item.variacion.tamano?.descripcion || 'N/A' }}
                    </span>
                  </h6>
                </template>
                <span v-else>-</span>
              </td>
              <td>
                <h6>
                  <template v-if="item.variacion.longitud?.descripcion != null">
                    <span class="badge bg-info me-1">
                      {{ item.variacion.longitud?.descripcion || 'N/A' }}
                    </span>
                  </template>
                  <span v-else>-</span>
                </h6>
              </td>
              <td>S/{{ item.precio_unitario.toFixed(2) || 0 }}</td>
              <td>
                <template v-if="item.cantidad >= 500">
                  <span class="badge bg-success me-1">
                    {{ item.cantidad }}
                  </span>
                </template>
                <template v-if="item.cantidad < 500 && item.cantidad > 50">
                  <span class="badge bg-primary me-1">
                    {{ item.cantidad }}
                  </span>
                </template>
                <template v-if="item.cantidad <= 50 && item.cantidad > 10">
                  <span class="badge bg-warning me-1">
                    {{ item.cantidad }}
                  </span>
                </template>
                <template v-if="item.cantidad <= 10">
                  <span class="badge bg-danger me-1">
                    {{ item.cantidad }}
                  </span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination-container">
          <button
            @click="cambiarPagina(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="pagination-btn"
          >
            Anterior
          </button>
          <span class="pagination-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button
            @click="cambiarPagina(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="pagination-btn"
          >
            Siguiente
          </button>
        </div>

        <!-- Selector de Resultados por Página -->
        <div class="mb-3 mt-3">
          <label for="perPage" class="form-label">Resultados por página:</label>
          <select v-model="perPage" @change="obtenerInventario" id="perPage" class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
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
