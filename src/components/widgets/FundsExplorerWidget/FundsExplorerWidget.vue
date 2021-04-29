<template>
	<Card class="card-f" :loading="loading" :error="error">
		<template #title>
			{{translate(title)}}
		</template>

		<template #body>
			<vue-tree
                style="width: 800px; height: 600px; border: 1px solid gray;"
                :dataset="sampleData"
                :config="treeConfig"
            >
            <template v-slot:node="{ node, collapsed }">
                <div
                    class="rich-media-node"
                    :style="{ border: collapsed ? '2px solid grey' : '' }"
                >
                    {{node.address}}: {{node.value}}
                </div>
            </template>
            </vue-tree>
		</template>
	</Card>
</template>

<script>
import VueTree from '@ssthouse/vue-tree-chart';
import Card from '@/components/containers/Card.vue';
import AccountService from '../../../infrastructure/AccountService';
import { TransactionType } from 'symbol-sdk';

export default {
	components: {
        VueTree,
		Card
	},

	props: {
		// Data Manager getter (DataSet, Timeline, Filter)
		managerGetter: {
			type: String
		},
		// Object or Array. If not provided, will use data from Data Manager
		dataGetter: {
			type: String
		}
	},

    mounted() {
        setTimeout(() => {
            this.fetchFundsSourceByAddress('TDQPV6KDC7ICTGWRFVBIXYAX7HEGHHWBDP3P2FI');
        }, 5000)
        
    },

    data() {
        return {
            sampleData: {
                value: '1',
                children: [
                    { value: '2', children: [{ value: '4' }, { value: '5' }] },
                    { value: '3' }
                ]
            },
            treeConfig: { nodeWidth: 120, nodeHeight: 80, levelHeight: 200 }
        }
    },

	computed: {
		loading() {
			return this.manager.loading;
		},

		error() {
			return this.manager.error;
		},

		address() {

        }
	},

	methods: {
		translate(e) {
			return this.$store.getters['ui/getNameByKey'](e);
		},

		getter(name) {
			return this.$store.getters[name];
		},

        async fetchFundsSourceByAddress() {
            const address = this.getter('account/getCurrentAccountAddress');
            const sleep = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            let transactions = [];
            const pageSize = 100;
            let pageNumber = 1;
            
            while(true) {
                let transferTransactionsPage = [];

                try {
                    transferTransactionsPage = (await AccountService
                        .getAccountTransactionList({pageNumber, pageSize}, { type: [TransactionType.TRANSFER] }, address)).data;
                }
                catch(e) {
                    await sleep(5000);

                    try {
                        transferTransactionsPage = (await AccountService
                            .getAccountTransactionList({pageNumber, pageSize}, { type: [TransactionType.TRANSFER] }, address)).data;
                    }
                    catch(e) {
                        console.log('Failed to get transaction list for address '+ address, {pageNumber, pageSize}, e.statusCode);
                    }
                }

                if (transferTransactionsPage.length) {
                    transactions = [...transactions, ...transferTransactionsPage.filter(tx => tx.signer !== address)];
                    pageNumber++;  
                }
                else {
                    pageNumber = 0;
                    break;
                }   
            }

            let origins = {};
            transactions.forEach(transaction => {
                if (!origins[transaction.signer])
                    origins[transaction.signer] = 0;

                origins[transaction.signer] += !isNaN(0 + transaction.extendGraphicValue.nativeMosaic) ? transaction.extendGraphicValue.nativeMosaic : 0;
            });

            console.log({origins})
            const tree = Object.keys(origins).map(address => ({ address, value: origins[address]}));
            this.sampleData = tree;
        }
	}
};
</script>

<style scoped>
.map-width-limit {
    min-width: 500px;
}

@media (max-width: 764px) {
    .map-width-limit {
        min-width: 250px;
    }
}

.map-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.map {
    border-radius: 10px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
    padding: 0;
    margin: 10px 20px;
}
</style>
