// import { MyAccountResponse } from "./payment.slice";
// import { Product } from "./types";

// export const updateProductById = (
//     products: Product[],
//     product_id: number,
//     updater: (p: Product) => void
//   ) => {
//     const product = products.find(p => p.id === product_id);
//     if (product) {
//       updater(product);
//     }
//   };

//   export const updateBankById = (
//     accounts: MyAccountResponse[],
//     account_id: number,
//     updater: (p: MyAccountResponse) => void
//   ) => {
//     const account = accounts.find(a => a.id === account_id);
//     if (account) {
//       updater(account);
//     }
//   };