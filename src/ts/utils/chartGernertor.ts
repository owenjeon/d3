import * as d3 from 'd3';
import {Axis} from "utils/axis";
import {Line, Area} from "utils/series";
import {makeDate, priceToKmoney} from "utils/_util";
window['d3'] = d3;
export const GenerateChart:any = class {
	generateData:any = {};
	chart:any;
	durationBtns:any[];
	seriesList = new Map;
	extreme:any = 36;
	isTotalAxis = false;

	container;
	chartSize;
	axis:any = {};
	colors = {
		sales: {amount: '#2D60A3', price: '#2D60A3', minMax:'rgb(124,181,236)', eachPoint: 'rgba(78, 127, 183, .5)'},
		rent: {amount: '#ef7a00', price: '#ef7a00', minMax:'#ef7a00', eachPoint: 'rgb(255, 174, 89)'}
	};
	static deepClone (obj) {
		return JSON.parse(JSON.stringify(obj))
	}
	static priceToKmoney(price, attachTag) {
		if (!price) {
			return 0;
		} else if (price < 10000) {
			return price.toString().replace(/(\d)(\d{3})$/, '$1,$2')
		} else {
			var strUk = "억";
			if (attachTag) {
				strUk = "<span>" + strUk + "</span>";
			}
			return Math.floor(price / 10000) + strUk + (GenerateChart.priceToKmoney(price % 10000) || '');
		}
	}
	constructor(generateData){
		this.generateData = generateData;
	}
	setData(data){
		return this.generateData.setData(data);
	}
	putDurationFilterBtns(ele, cls = 'item'){
		this.durationBtns = [1,3,5, 'total'].map((v:any) => {
			const btn = document.createElement('BUTTON');
			btn.className = cls;
			btn.innerHTML = v !== 'total' ? `${v}년` : '전체';
			btn.dataset.name = v.toString();
			btn.addEventListener('click', (e) => this.zoomByYear(e));
			return btn;
		});
		this.durationBtns.forEach(btn => ele.appendChild(btn));
	}
	bindBtnDataset(currentLen){ //전체 기간 버튼에 dataset 바꾸는 함수
		this.durationBtns.map((btn:any) => {
			const due = (btn.dataset.name !== 'total') ? btn.dataset.name*12 : Math.max(currentLen, 8);
			btn.dataset.month = due.toString();
		});
	}
	async addSeriesData(saleType, data){
	}
	removeSeriesData(saleType){
	}
	drawChangedData(saleType) {
	}
	setCategories(firstDate){
	}
	setMaxXAxis(saleType){
	}

	changeSeriesData(saleType, data){
	}
	setSeriesData(seriesList, d){
	}
	zoomByYear(e){
		const du = 60;

	}
	createSeriesSet(type, [amount, price, minMax, scatterData]) {
		const {xTime, yRange, yAmount} = this.axis;
		const area = new Area({curve: d3.curveMonotoneX})
			.readyBinding({x:d => xTime.scale(d.x), y0:d => yRange.scale(d.low), y1: d => yRange.scale(d.high)})
			.append(this.container).appendStyle(['fill', '#f9dcaa'])
			.bindData(minMax);

		const line = new Line({curve: d3.curveMonotoneX})
			.readyBinding({x:d => xTime.scale(d.x), y:d => yRange.scale(d.y)})
			.append(this.container).appendStyle(['fill', 'none'], ['stroke', 'red'], ['stroke-width', 2])
			.bindData(price);

		const column = new Area({curve: d3.curveStep})
			.readyBinding({x:d => xTime.scale(d[0]), y0:d => yAmount.scale(d[1]), y1: this.chartSize.h / 5})
			.append(this.container.append('g').attr('transform', `translate(0, ${this.chartSize.h * 4 / 5})`))
			.appendStyle(['fill', '#ddd'])
			.bindData(amount.filter(d => !isNaN(d[1])));
	}
	setAxis(amount, price, minMax){
		const priceRange = d3.extent(minMax.map(d => [d.low, d.high]).reduce((p, c) => p.concat(c), []));
		this.axis.xTime.setDomain(this.generateData.days, [0, this.chartSize.w])
			.setAxis('axisBottom', (o) => o.tickFormat(d3.timeFormat("%Y") || '').ticks(d3.timeYear))
			.render(this.container, 'x-axis', o => o.attr('transform', `translate(0, ${this.chartSize.h})`));

		this.axis.yRange.setDomain(priceRange, [this.chartSize.h * 0.8, 0])
			.setAxis('axisLeft', o => o.tickFormat(d => priceToKmoney(d)).tickSize(-this.chartSize.w).ticks(6))
			.render(this.container, 'axis-price');

		this.axis.yAmount.setDomain(d3.extent(amount.map(d => d[1])), [this.chartSize.h / 5, 0]);
	}
	resize(){
		
	}
	render({element, data}){
		this.generateData.setCategory(makeDate(...[].concat(data.graph[0].date.match(/\d+/g))));
		const [amount, price, minMax, scatterData] = this.setData(data);
		const div = d3.select(element);
		const svg = div.append('svg').attr('height', div.style('height')).attr('width', div.style('width'));
		const margin = [10, 10, 50, 60];
		this.chartSize = {
			w: parseInt(svg.style('width')) - margin[1] - margin[3],
			h: parseInt(svg.style('height')) - margin[0] - margin[2]
		};
		const priceRange = d3.extent(minMax.map(d => [d.low, d.high]).reduce((p, c) => p.concat(c), []));
		this.container = svg.append('g').attr('transform', `translate(${margin[3]}, ${margin[0]})`);
		const view = this.container.append('rect').attr("x", 0.5).style('fill', 'transparent')
            .attr("y", 0.5)
            .attr("width", this.chartSize.w - 1)
            .attr("height", this.chartSize.h - 1);
		this.axis.xTime = new Axis('scaleBand');
		this.axis.yRange = new Axis('scaleLinear');
		this.axis.yAmount = new Axis('scaleLinear');
		this.setAxis(amount, price, minMax);
		this.createSeriesSet('sales', [amount, price, minMax, scatterData]);
        const axis = this.axis;
	}
};