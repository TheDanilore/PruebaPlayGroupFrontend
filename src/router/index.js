import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductList from '../components/store/ProductList.vue'
import ProductDetail from '../components/store/ProductDetail.vue'
import ProductListAdmin from '../components/admin/ProductListAdmin.vue'
import InventarioList from '../components/admin/InventarioList.vue'
import CategoriaListAdmin from '../components/admin/CategoriaListAdmin.vue'
import TamanosListAdmin from '../components/admin/TamanosListAdmin.vue'
import LongitudesListAdmin from '../components/admin/LongitudesListAdmin.vue'
import ColoresListAdmin from '../components/admin/ColoresListAdmin.vue'
import ProveedoresListAdmin from '../components/admin/ProveedoresListAdmin.vue'
import UnidadesMedidasListAdmin from '../components/admin/UnidadesMedidasListAdmin.vue'
import UbicacionesListAdmin from '../components/admin/UbicacionesListAdmin.vue'
import UsuariosListAdmin from '../components/admin/UsuariosListAdmin.vue'
import RolesListAdmin from '../components/admin/RolesListAdmin.vue'
import PermisosListAdmin from '@/components/admin/PermisosListAdmin.vue'
import LoginAdmin from '@/components/admin/LoginAdmin.vue'

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/productos',
    name: 'ProductList',
    component: ProductList,
  },
  {
    path: '/productos/:id',
    name: 'ProductosDetalle',
    component: ProductDetail,
  },
  {
    path: '/login/admin',
    name: 'LoginAdmin',
    component: LoginAdmin,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
]

// Rutas protegidas que requieren autenticación y rol de admin
const adminRoutes = [
  {
    path: '/admin',
    redirect: '/productos/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '/productos/admin',
        name: 'ProductListAdmin',
        component: ProductListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/inventario/admin',
        name: 'InventarioList',
        component: InventarioList,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/categoriaproductos/admin',
        name: 'CategoriaListAdmin',
        component: CategoriaListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/colores/admin',
        name: 'ColoresListAdmin',
        component: ColoresListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/longitudes/admin',
        name: 'LongitudesListAdmin',
        component: LongitudesListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/tamanos/admin',
        name: 'TamanosListAdmin',
        component: TamanosListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/proveedores/admin',
        name: 'ProveedoresListAdmin',
        component: ProveedoresListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/unidadesmedidas/admin',
        name: 'UnidadesMedidasListAdmin',
        component: UnidadesMedidasListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/ubicaciones/admin',
        name: 'UbicacionesListAdmin',
        component: UbicacionesListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/usuarios/admin',
        name: 'UsuariosListAdmin',
        component: UsuariosListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/roles/admin',
        name: 'RolesListAdmin',
        component: RolesListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/permisos/admin',
        name: 'PermisosListAdmin',
        component: PermisosListAdmin,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...adminRoutes],
})

// Función para verificar si el token es válido
const isValidToken = () => {
  const token = localStorage.getItem('adminToken')
  if (!token) return false

  // Aquí puedes agregar más validaciones del token si es necesario
  // Por ejemplo, verificar si no ha expirado
  return true
}

// Función para verificar el rol de administrador
const isAdmin = () => {
  const userRole = localStorage.getItem('userRole')
  return userRole === 'admin'
}

// Guard de navegación
router.beforeEach((to, from, next) => {
  // Si la ruta es el login y ya está autenticado, redirigir al panel admin
  if (to.path === '/login/admin' && isValidToken() && isAdmin()) {
    next('/productos/admin')
    return
  }

  // Verificar si la ruta requiere autenticación
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Si no hay token válido, redirigir al login
    if (!isValidToken()) {
      next({
        path: '/login/admin',
        query: { redirect: to.fullPath },
      })
      return
    }

    // Verificar si la ruta requiere rol de admin
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!isAdmin()) {
        next('/')
        return
      }
    }
  }

  next()
})

export default router
