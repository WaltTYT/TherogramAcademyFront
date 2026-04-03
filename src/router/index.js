import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login/login.vue'
import LoginPage from '../views/Login/LoginPage.vue'
import RegisterPage from '../views/Register/RegisterPage.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import CourseManagement from '../views/admin/CourseManagement.vue'
import CourseDetail from '../views/admin/CourseDetail.vue'
import CourseResource from '../views/admin/CourseResource.vue'
import CourseResourceDetail from '../views/admin/CourseResourceDetail.vue'
import Homework from '../views/admin/Homework.vue'
import HomeworkDetail from '../views/admin/HomeworkDetail.vue'
import CourseStatistic from '../views/admin/CourseStatistic.vue'
import UserManagement from '../views/admin/UserManagement.vue'
import UserDetail from '../views/admin/UserDetail.vue'
import TeacherLayout from '../views/teacher/TeacherLayout.vue'
import StudentLayout from '../views/student/StudentLayout.vue'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminLayout,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course',
        name: 'AdminCourseManagement',
        component: CourseManagement,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course/detail/:id',
        name: 'AdminCourseDetail',
        component: CourseDetail,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course-resource',
        name: 'AdminCourseResource',
        component: CourseResource,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course-resource/detail/:id',
        name: 'AdminCourseResourceDetail',
        component: CourseResourceDetail,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework',
        name: 'AdminHomework',
        component: Homework,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework/detail/:id',
        name: 'AdminHomeworkDetail',
        component: HomeworkDetail,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'statistics',
        name: 'AdminCourseStatistic',
        component: CourseStatistic,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'user-management',
        name: 'AdminUserManagement',
        component: UserManagement,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'user-detail/:id',
        name: 'AdminUserDetail',
        component: UserDetail,
        meta: {
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/teacher',
    name: 'Teacher',
    component: TeacherLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'TeacherDashboard',
        component: () => import('../views/teacher/Dashboard.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course',
        name: 'TeacherCourseManage',
        component: () => import('../views/teacher/CourseManage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course/create',
        name: 'TeacherCourseCreate',
        component: () => import('../views/teacher/CourseCreate.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course/:id',
        name: 'TeacherCourseDetail',
        component: () => import('../views/teacher/CourseDetail.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'resource',
        name: 'TeacherResourceManage',
        component: () => import('../views/teacher/ResourceManage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'resource/create',
        name: 'TeacherResourceCreate',
        component: () => import('../views/teacher/ResourceCreate.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'resource/:id',
        name: 'TeacherResourceDetail',
        component: () => import('../views/teacher/ResourceDetail.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework',
        name: 'TeacherHomeworkManage',
        component: () => import('../views/teacher/HomeworkManage.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework/create',
        name: 'TeacherHomeworkCreate',
        component: () => import('../views/teacher/HomeworkCreate.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework/:id',
        name: 'TeacherHomeworkDetail',
        component: () => import('../views/teacher/HomeworkDetail.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework/:id/student/:studentId',
        name: 'TeacherStudentHomeworkDetail',
        component: () => import('../views/teacher/StudentHomeworkDetail.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'statistic',
        name: 'TeacherStatistic',
        component: () => import('../views/teacher/Statistic.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'user-management',
        name: 'TeacherUserManagement',
        component: () => import('../views/teacher/UserManagement.vue'),
        meta: {
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/student',
    name: 'Student',
    component: StudentLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'StudentDashboard',
        component: () => import('../views/student/Dashboard.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'select-course',
        name: 'StudentSelectCourse',
        component: () => import('../views/student/SelectCourse.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'my-course',
        name: 'StudentMyCourse',
        component: () => import('../views/student/MyCourse.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'course/:id',
        name: 'StudentCourseDetail',
        component: () => import('../views/student/CourseDetail.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'my-homework',
        name: 'StudentMyHomework',
        component: () => import('../views/student/MyHomework.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework/:id',
        name: 'StudentHomeworkDetail',
        component: () => import('../views/student/HomeworkDetail.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'homework/:id/submit',
        name: 'StudentSubmitHomework',
        component: () => import('../views/student/SubmitHomework.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'statistic',
        name: 'StudentStatistic',
        component: () => import('../views/student/Statistic.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'user-management',
        name: 'StudentUserManagement',
        component: () => import('../views/student/UserManagement.vue'),
        meta: {
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router