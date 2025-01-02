<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { reactive } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface RowType {
  publicKey: string;
  secretKey: string;
  mnemonic: string;
}

const walletList = reactive<RowType[]>([]);

const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'publicKey', title: 'PublicKey' },
    { field: 'secretKey', title: 'SecretKey' },
    { field: 'mnemonic', title: '助记词' },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    pageSize: 200,
  },
  data: walletList,
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: false,
    resizable: true,
    search: false,
    zoom: true,
  },
};

const [Grid] = useVbenVxeGrid({
  gridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Card class="">
      <Button class="mr-2" type="primary">生成账号</Button>
    </Card>
    <Grid />
  </Page>
</template>
