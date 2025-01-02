import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        name: 'PumpfunTasks',
        path: '/demos/pumpfun',
        component: () => import('#/views/demos/pumpfun/index.vue'),
        meta: {
          title: $t('demos.pumpfun.title'),
        },
      },
    ],
  },
];

export default routes;
