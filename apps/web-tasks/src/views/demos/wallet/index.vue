<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { ref, unref } from 'vue';
import { Page } from '@vben/common-ui';
import { Card, message, InputNumber } from 'ant-design-vue';
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
  data: [
    {
      mnemonic:
        'shrimp also grain clown catalog punch try village adult science pull pulp',
      publicKey: '82d2U6GzGfxw8yzGhDsv5JaMj6iu1f67wwZhGngLuddn',
      secretKey:
        '2cay9aJy1K83th4jkeL4TmGrMrrs9DmpB3hCiKvpoBpDe7dktLHKbQPuSMtXteyD4r2wDBRXurD9xEr4evsF3frt',
    },
  ],
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
    data: walletList
  })
  message.success(`生成成功 ${count} 个成功`);
};
</script>

<template>
  <Page auto-content-height>
    <Card>
      <InputNumber v-model:value="walletNumber" step="10">
        <template #addonAfter>
          <div @click="genWallet">生成账号</div>
        </template>
      </InputNumber>
    </Card>
    <Grid />
  </Page>
</template>
