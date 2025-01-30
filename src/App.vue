<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AdminMenu from './components/admin/AdminMenu.vue'
import { ref } from 'vue'

const route = useRoute()
const isAdminRoute = route.path.includes('/admin')
const menuOpen = ref(false)
const isLoggedIn = ref(!!localStorage.getItem('adminToken'))
const isDesktop = ref(window.innerWidth >= 768)

// Monitorear el tamaño de la pantalla
window.addEventListener('resize', () => {
  isDesktop.value = window.innerWidth >= 1024
})

// Función para cerrar sesión
const handleLogout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userRole')
  isLoggedIn.value = false
  window.location.href = '/login/admin'
}

// Alternar el menú de navegación móvil
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <RouterLink to="/" class="logo">
          <img v-if="!isDesktop" src="./assets/logo.png" alt="Logo" class="logo-img" />
          <h1 v-if="isDesktop">The Danilore Store</h1>
        </RouterLink>
      </div>

      <nav :class="{ 'nav-menu': true, 'nav-open': menuOpen }">
        <RouterLink to="/productos" class="nav-link" active-class="router-link-active">
          Ver Productos
        </RouterLink>
        <RouterLink
          v-if="!isLoggedIn"
          to="/login/admin"
          class="nav-link"
          active-class="router-link-active"
        >
          Login
        </RouterLink>
        <RouterLink
          v-if="isLoggedIn"
          to="/productos/admin"
          class="nav-link"
          active-class="router-link-active"
        >
          Admin
        </RouterLink>
        <button v-if="isLoggedIn" class="nav-link" @click="handleLogout">Cerrar Sesión</button>
      </nav>

      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">☰</button>
    </div>
  </header>

  <AdminMenu v-if="isAdminRoute" />

  <main class="content">
    <RouterView />
  </main>
  <!-- Footer -->
  <footer class="footer mt-5 py-4">
    <div class="container text-center">
      <p class="mb-0">
        &copy; {{ new Date().getFullYear() }} The Danilore Store. Todos los derechos reservados.
      </p>
    </div>
  </footer>
</template>

<style scoped>
/* Logo */
.logo-img {
  width: 100px;
  /* Ajusta el ancho según lo necesites */
  height: auto;
  /* Mantén la proporción de la imagen */
  display: block;
  /* Evita que se comporte como texto en línea */
  margin: 0 auto;
  /* Centra la imagen horizontalmente */
  object-fit: contain;
  /* Asegura que la imagen no se distorsione */
}

.logo h1 {
  color: #caba45;
  margin: 0 0;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin: 1rem 0rem;
}

.logo {
  text-decoration: none;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: white;
}

.header {
  background-color: #ffffff;
  padding: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.search-container {
  position: relative;
  width: 300px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: #ff5c5c;
  color: white;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #333;
}

.content {
  margin-top: 5rem;
  padding: 1rem;
  max-width: auto;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .logo-img {
    width: 80px;
    margin-left: 20px;
  }

  .header-container {
    padding: 1rem;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #ffffff;
    flex-direction: column;
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
  }

  .nav-menu.nav-open {
    max-height: 500px;
    padding: 1rem 0;
  }

  .search-container {
    width: calc(100% - 2rem);
    margin: 0 auto;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: 1rem;
    border-bottom: 1px solid #f1f1f1;
  }

  .menu-toggle {
    display: block;
  }
}
</style>
