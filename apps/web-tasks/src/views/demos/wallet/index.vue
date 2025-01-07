<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { ref, unref } from 'vue';
import { Page } from '@vben/common-ui';
import { message, InputNumber } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { generateMultipleWallets } from '#/utils/gen-solana-wallet';

interface RowType {
  publicKey: string;
  secretKey: string;
  mnemonic: string;
}

const walletNumber = ref(10);

const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'publicKey', title: '公钥' },
    { field: 'secretKey', title: '私钥' },
    { field: 'mnemonic', title: '助记词' },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    pageSize: 200,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: false,
    resizable: true,
    search: false,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});

const genWallet = () => {
  const count = unref(walletNumber);
  const walletList = generateMultipleWallets(count);
  console.log(walletList);
  gridApi.setGridOptions({
    data: walletList,
  });
  message.success(`生成 ${count} 个钱包成功`);
};
</script>

<template>
  <Page auto-content-height>
    <template #title>
      <InputNumber v-model:value="walletNumber" step="10" min="0">
        <template #addonAfter>
          <div class="cursor-pointer" @click="genWallet">生成钱包</div>
        </template>
      </InputNumber>
    </template>
    <Grid />
  </Page>
</template>
