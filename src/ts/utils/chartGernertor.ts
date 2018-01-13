import * as d3 from 'd3';
import {Axis} from "utils/axis";
import {Line, Area} from "utils/series";
import {makeDate, priceToKmoney} from "utils/_util";
window['d3'] = d3;

const d3Transition = (t, duration=1000, delay=0) =>  t.delay(delay).duration(duration);

export const GenerateChart:any = class {
	generateData:any = {};
	durationBtns:any[];
	seriesList = new Map;
	extreme:any = 36;
	isTotalAxis = false;
	zoom;
	container;
	chartSize;
	axis:any = {};
    zoomedScale = undefined;
	colors = {
		sales: {amount: '#2D60A3', price: '#2D60A3', minMax:'rgb(124,181,236)', eachPoint: 'rgba(78, 127, 183, .5)'},
		rent: {amount: '#ef7a00', price: '#ef7a00', minMax:'rgb(255, 174, 89)', eachPoint: 'rgb(255, 174, 89)'}
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
		this.createSeriesSet(saleType, this.setData(data));
	}
	removeSeriesData(saleType){
		this.seriesList.has(saleType) && [...this.seriesList.get(saleType).values()].forEach(v => {
			v.bindData([]).draw();
        });
	}
	drawChangedData(saleType) {
	}
	setCategories(firstDate){
	}
	setMaxXAxis(saleType){
	}

	changeSeriesData(saleType, data){
		let seriesList = this.seriesList.get(saleType);
		const d = this.setData(data);
		this.setSeriesData(seriesList, d)
	}
	setSeriesData(seriesList, [amount, price, minMax, scatterData]){
		seriesList.get('area').bindData(minMax).transition(d3Transition, 1000);
		seriesList.get('line').bindData(price).transition(d3Transition, 1000);
		seriesList.get('column').bindData(amount.filter(d => !isNaN(d.y))).transition(d3Transition, 1000);
	}
	zoomByYear(e){

	}
	createSeriesSet(type, [amount, price, minMax, scatterData]) {
        const {xTime, yRange, yAmount} = this.axis;
		const series = this.seriesList.set(type, new Map).get(type);
		const c = this.colors[type];

		series.set('area', new Area({curve: d3.curveMonotoneX})
			.append(this.container).appendStyle(['fill', c.minMax], ['clip-path', 'url(#clip)'])
            .readyBinding({x:d => (this.zoomedScale || xTime.scale)(d.x), y0:d => yRange.scale(d.low), y1: d => yRange.scale(d.high)})
		);

		series.set('line', new Line({curve: d3.curveMonotoneX})
			.append(this.container).appendStyle(['fill', 'none'], ['stroke', c.price], ['stroke-width', 2], ['clip-path', 'url(#clip)'])
            .readyBinding({x:d => (this.zoomedScale || xTime.scale)(d.x), y:d => yRange.scale(d.y)})
            .bindData(minMax.map(d => (d.y = 10000, d))).draw()
		);

		series.set('column', new Area({curve: d3.curveStep})
			.append(this.container.append('g').attr('transform', `translate(0, ${this.chartSize.h * 4 / 5})`))
            .appendStyle(['fill', c.amount], ['clip-path', 'url(#clip)'])
            .readyBinding({x:d => (this.zoomedScale || xTime.scale)(d.x), y0:d => yAmount.scale(d.y), y1: this.chartSize.h / 5})
		);

		this.setSeriesData(series, [amount, price, minMax, scatterData]);
	}
	setAxis(amount, price, minMax){
		const priceRange = d3.extent(minMax.map(d => [d.low, d.high]).reduce((p, c) => p.concat(c), []));
		this.axis.xTime.setDomain(d3.extent(this.generateData.days), [0, this.chartSize.w])
			.setAxis('axisBottom', (o) => o.tickFormat(d3.timeFormat("%Y") || '').ticks(d3.timeYear))
			.render(this.container, 'x-axis', o => o.attr('transform', `translate(0, ${this.chartSize.h})`));

		this.axis.yRange.setDomain(priceRange, [this.chartSize.h * 0.8, 0])
			.setAxis('axisLeft', o => o.tickFormat(d => priceToKmoney(d)).tickSize(-this.chartSize.w).ticks(6))
			.render(this.container, 'axis-price');

		this.axis.yAmount.setDomain(d3.extent(amount.map(d => d.y)), [this.chartSize.h / 5, 0]);
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
		this.container = svg.append('g').attr('transform', `translate(${margin[3]}, ${margin[0]})`);
		svg.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", this.chartSize.w).attr("height", this.chartSize.h);
		this.axis.xTime = new Axis('scaleTime');
		this.axis.yRange = new Axis('scaleLinear');
		this.axis.yAmount = new Axis('scaleLinear');
		this.setAxis(amount, price, minMax);
		this.createSeriesSet('sales', [amount, price, minMax, scatterData]);
		const axis = this.axis;
		this.zoom = d3.zoom()
			.scaleExtent([1, 40])
			.translateExtent([[0,0], [this.chartSize.w, this.chartSize.h]])
			.extent([[0, 0], [this.chartSize.w, this.chartSize.h]])
			.on("zoom", () => {
				const t = d3.event.transform;
				const newScale:any = t.rescaleX(axis.xTime.scale);
				this.seriesList.forEach((v) => {
					v.forEach(v2 => v2.path.attr('d', v2.graph.x((d:any) => newScale((d.x)))));
				})
				axis.xTime.g.call(axis.xTime.axis.scale(newScale));
				this.zoomedScale = newScale;
			});
		svg.call(this.zoom);
	}
};