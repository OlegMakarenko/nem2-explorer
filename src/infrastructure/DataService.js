/*
 *
 * Copyright (c) 2019-present for NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import axios from 'axios';
import http from './http';
import dto from './dto';

class DataService {
  /**
   * Gets cryptocurrency market price from https://min-api.cryptocompare.com/
   * @param cryptocurrency - name such as XEM, BTC
   * @returns Object of data
   */
  static getMarketPrice = (cryptocurrency) => {
  	return new Promise((resolve, reject) => {
  		let url = http.marketDataUrl + `data/pricemultifull?fsyms=${cryptocurrency}&tsyms=USD`;

  		axios
  			.get(url)
  			.then(res => {
  				return resolve(res.data.DISPLAY);
  			})
  			.catch(error => {
  				// reject(new Error('Fail to request XEM price.'))
  				reject(new Error(error));
  			});
  	});
  }

  /**
   * Gets cryptocurrency historical hourly graph from https://min-api.cryptocompare.com/
   * @param cryptocurrency - name such as XEM, BTC
   * @returns Array of Data
   */
  static getHistoricalHourlyGraph = (cryptocurrency) => {
  	return new Promise((resolve, reject) => {
  		let url = http.marketDataUrl + `data/histohour?fsym=${cryptocurrency}&tsym=USD&limit=168`;

  		axios
  			.get(url)
  			.then(res => {
  				return resolve(res.data);
  			})
  			.catch(error => {
  				// reject(new Error('Fail to request Xem historical hourly graph.'))
  				reject(new Error(error));
  			});
  	});
  }

  /**
   * Gets array of namespaceInfo
   * @param limit - No of namespaceInfo
   * @param fromHash - (Optional) retrive next namespaceInfo in pagination
   * @returns namespaceInfo[]
   */
  static getNamespacesFromIdWithLimit = async (limit, fromNamespaceId) => {
  	let namespaceId;

  	if (fromNamespaceId === undefined)
  		namespaceId = 'latest';
  	else
  		namespaceId = fromNamespaceId;

  	// Make request.
  	const path = `/namespaces/from/${namespaceId}/limit/${limit}`;
  	const response = await axios.get(http.nodeUrl + path);
  	const namespaceInfo = response.data.map(info => dto.createNamespaceInfoFromDTO(info, http.networkType));

  	return namespaceInfo;
  }

  /**
   * Gets array of accounts
   * @param limit - No of account
   * @param accountType - filter account type
   * @param fromAddress - (Optional) retrive next account in pagination
   * @returns accountInfo[]
   */
  static getAccountsFromAddressWithLimit = async (limit, accountType, fromAddress) => {
  	let address;

  	if (fromAddress === undefined)
  		address = 'most';
  	else
  		address = fromAddress;

  	// Make request.
  	const path = `/accounts/${accountType}/from/${address}/limit/${limit}`;
  	const response = await axios.get(http.nodeUrl + path);
  	const accounts = response.data.map(info => dto.createAccountInfoFromDTO(info, http.networkType));

  	return accounts;
  }
}

export default DataService;
