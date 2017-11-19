import * as d3 from 'd3';
import {Axis} from "utils/axis";
import {Line, Area} from "utils/series";
import {GenerateRealTradeData as GenerateData} from 'utils/reformData';
import {GenerateChart} from 'utils/chartGernertor';

const apis_host = 'https://apis.zigbang.com';


const days = [];
for (let i = 0; i < 24; i++) {
	const x = new Date();
	x.setDate(1);
	x.setMonth(x.getMonth() - i);
	days.unshift(x);
}
const tmpData = {
	"range": [[12.7, 18.3], [12, 17.1], [12, 20.8], [12.2, 15.5], [14.4, 14.4], [17.2, 17.2], [18.1, 18.1], [11.4, 22.6], [13.6, 19.6], [12.6, 22.4], [11.8, 20.7], [11.6, 23.7], [11, 23.3], [10.7, 23.7], [11.6, 21.8], [9.2, 23.8], [10.5, 21.4], [13.5, 24.8], [17.8, 25.7], [16.5, 25], [16.7, 29.8], [15.5, 29.6], [14.5, 27.8], [14.3, 27.7]],
	"average": [15.3, 14.6, 15.7, 13.7, 14.4, 17.2, 18.1, 17.8, 16.3, 17.7, 16.8, 17.7, 17.6, 17.5, 17.7, 16.4, 15.4, 18.3, 21.3, 21.4, 23.8, 23, 22.1, 21.5],
	"trade": [3, 1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 4, 1]
};



class AreaContainer {
	chartContainer;
	listContainer;
	saleTypes:any;
	currentData = {danjiId: undefined, roomTypeId: undefined, saleType: [], group:
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
