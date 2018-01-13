import * as d3 from 'd3';
import {Axis} from "utils/axis";
import {Line, Area} from "utils/series";
import {GenerateRealTradeData as GenerateData} from 'utils/reformData';
import {GenerateChart} from 'utils/chartGernertor';

const apis_host = 'https://apis.zigbang.com';


class AreaContainer {
	chartContainer;
	listContainer;
	saleTypes:any;
	currentData:any = {danjiId: undefined, roomTypeId: undefined, saleType: [], group:
		[{type:'sales', tit:'매매'}, {type:'rent', tit: '전세'}].map(v => Object.assign(v, {isActivate: false, data:undefined}))
	};
	dataStore:any = new Map();
	static makeDate(y=2016, m=1, d=1){
		return Date.UTC(y, m-1, 1);
	}
	constructor(){
		this.chartContainer = new GenerateChart(new GenerateData);
		window['a'] = this.chartContainer; //임시
		Object.defineProperty(this.currentData, 'saleType', {
			get : () => this.currentData.group.filter(v => v.isActivate).map(v => v.type)
		})
	}

	async init({danjiId, roomTypeId, saleType, element}){
		const data = await this.getData(danjiId, roomTypeId, saleType);
		this.putSaleTypeBtn(document.querySelector('#type-info-tab-chart .sub-title-box .btns'), saleType);
		this.chartContainer.putDurationFilterBtns(document.getElementById('chart-year-tab'), 'item');
		this.chartContainer.render({element, data});
	}
	async getData(danjiId, roomTypeId, saleType){
		const graphId = `${danjiId}-${roomTypeId}-${saleType}`;
		const data = await (this.dataStore.has(graphId) ?
			Promise.resolve(this.dataStore.get(graphId)) :
			fetch(`${apis_host}/property/apartments/${danjiId}/${saleType === 'rent' ? 'realRent' : 'realSales'}/${roomTypeId}`, { method: 'GET', mode: 'cors'})
				.then(res => res.json()))
			.catch(()=>console.log('데이터 전송중 오류가 발생했습니다.6'));
		this.dataStore.set(graphId, data);
		this.currentData.group.filter(v => v.type === saleType)[0].data = data;
		Object.assign(this.currentData, {danjiId, roomTypeId});
		return data;
	}
	async update({danjiId = this.currentData.danjiId, roomTypeId = this.currentData.roomTypeId}){
		const result = await Promise.all(
			this.currentData.group.map( async (v) => {
				if(v.isActivate) {
					const data = await this.getData(danjiId, roomTypeId, v.type);
					return {data, type: v.type, state: true};
				} else {
					return {type: v.type, state: false};
				}
			})
		);
		result.forEach((o:any) => {
			if(!o.state) {
				this.chartContainer.removeSeriesData(o.type);
			} else {
				this.chartContainer.seriesList.has(o.type) ? this.chartContainer.changeSeriesData(o.type, o.data) : this.chartContainer.addSeriesData(o.type, o.data);
			}
		});
		this.chartContainer.drawChangedData(this.currentData.saleType);
	}
	putSaleTypeBtn(ele, saleType){
		const btns = [];
		const showAllBtn:any = document.createElement('BUTTON');
		this.saleTypes = this.currentData.group.map((v:any) => {
			const btn = document.createElement('BUTTON');
			btns.push(btn);
			v.data = undefined;
			let isChecked = false;
			const o =	Object.defineProperty(v, 'isActivate', {
				get: () => isChecked,
				set: (type) => {
					isChecked = type === v.type || type === 'all';
					btn.className = type === v.type ? 'active' : '';
					showAllBtn.className = type === 'all' ? 'active' : '';
				}
			});
			o.isActivate = saleType;
			btn.innerHTML = v.tit;
			btn.dataset.saletype = v.type;
			btn.addEventListener('click', (e:any) => {
				try{
					this.saleTypes.filter(v => v.type === e.target.dataset.saletype).forEach(v => {
						if(this.currentData.saleType.length === 1 && v.isActivate) throw '변경할 데이터가 없음';
						this.saleTypes.forEach(v2 => v2.isActivate = v.type)
					});
					this.update({});
				}
				catch(e){}

			});
			return o;
		});

		(() => {
			btns.push(showAllBtn);
			showAllBtn.innerHTML = "전체";
			showAllBtn.dataset.saletype = 'all';
			showAllBtn.addEventListener('click', (e:any) => {
				if(this.saleTypes.every(v => !v.isActivate)) return;
				this.saleTypes.forEach(v => v.isActivate = showAllBtn.dataset.saletype);
				this.update({});
			});
		})();

		ele.appendChild(btns.reduce((p, c) => (p.appendChild(c), p), document.createElement('div')));
	}
}

const areaContainer = new AreaContainer;
areaContainer.init({danjiId: 1052, roomTypeId:2832, saleType:"sales", element:'#transition-chart'});
