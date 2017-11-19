export const AreaListContainer = class {
	dataStore = new Map([['sales', []], ['rent', []]]);
	currentData;
	container;
	moreBtn;
	constructor(){
	}
	init({container, moreBtn}, saleType, data){
		this.container = container;
		this.moreBtn = moreBtn;
		this.saveData(saleType, data);
		this.drawData();
		this.moreBtn.addEventListener('click', () =>this.renderMore(5));
	}
	hideMoreBtn(){
		this.moreBtn.style.display = 'none';
	}
	showMoreBtn(){
		this.moreBtn.style.display = '';
	}
	removeData(saleType){
		this.dataStore.set(saleType, []);
	}
	saveData(saleType, data){
		this.dataStore.set(saleType, data);
	}
	drawData(){
		this.currentData = {data: [], showIndex: 0};
		this.dataStore.forEach((v, k) => {
			v.forEach(v2 => this.currentData.data.push(Object.assign(v2, {saleType: k})));
		});
		this.currentData.data.sort((a,b) => (new Date(b.date)).valueOf() - (new Date(a.date)).valueOf());
		this.renderMore(3);
	}
	renderMore(moreCnt){
		const maxLen = Math.min(this.currentData.showIndex + moreCnt, this.currentData.data.length );
		const moreArr = this.currentData.data.slice(this.currentData.showIndex, maxLen);
		maxLen === this.currentData.data.length ? this.hideMoreBtn() : this.showMoreBtn();
		if(this.currentData.showIndex === 0) this.container.innerHTML = '';
		this.currentData.showIndex = maxLen;
		this.parseHTML(moreArr);
	}
	parseHTML(partialData){
		partialData.forEach((d) => {
			const tr = document.createElement('TR');
			tr.innerHTML = `
				<td>${d.date.replace(/-/, '.')}</td>
				<td>${d.saleType === 'sales' ? '매매' : (d.rent === 0 ? '전세' : '월세')}${d.deposit}${d.rent ? '/'+d.rent : ""}</td>
				<td>${d['층']}층</td>
		`;
			this.container.appendChild(tr);
		});
	}
};

export const GenerateRealTradeData = class {
	static makeDate(y=2017, m=1, d=1){
		return Date.UTC(y || 2017, m-1, 1);
	}
	static getFloorMinMax(arr, o, minMax){
		const value = Math[minMax].apply(null, arr.filter(v=> v[0] === o.index && v[1] === o.price).map(v => v[2]));
		return isFinite(value) && value;
	}
	days:any;
	setCategory(firstDate){
		this.days = [];
		const x = (new Date(Date.UTC(2017, (new Date().getMonth())-59, 1)));
		const standard = Math.min(Number(x.valueOf()), firstDate);
		this.days = (function makeDays(i, arr){
			const x = (new Date(Date.UTC(2017, (new Date().getMonth())-i, 1)));
			arr.unshift(x.valueOf());
			return standard < x.valueOf() && makeDays(++i, arr), arr;
		})(0, []);
		this.days.push('DRTP');
		return this;
	}
	makeScatterData(arr) {
		return arr.filter(v => v.rent === undefined || v.rent === 0).map(v => {
			return [this.days.indexOf(GenerateRealTradeData.makeDate(...v.date.match(/\d+/g))), v.deposit, v['층']]
		})
	}
	setData(data){
		const scatterData = this.makeScatterData(data.detail);
		const tmpData = data.graph.reduce((p:any, c:any) => {
			const dateArr = c.date.match(/\d+/g);
			p[dateArr === null ?
				c.date : GenerateRealTradeData.makeDate(...dateArr)] = [
				c.qty,
				c.avg,
				[c.min||c.avg, c.max||c.avg]
			];
			return p;
		}, {});
		let tempPrice, tempPrice2, len = 0, distance = 0;
		const [amount, price, minMax] = this.days
			.map((day, index) => {
				let p;
				if(!(day in tmpData)){
					if(!tempPrice) return undefined;
					if(distance === 0){
						for(let i = index ; i < this.days.length ; i++){
							if(tmpData[this.days[i]]){
								distance = i - index;
								len = distance+1;
								tempPrice2 = tmpData[this.days[i]][1];
								break;
							}
						}
					}
					p = Math.round((tempPrice2-tempPrice)*((len - distance))/(len) + tempPrice);
					distance--;
					return [day, [0, p, [p, p], []]];
				}else{
					tempPrice = tmpData[day][1];
					return [day, tmpData[day]];
				}
				//return [index, day in tmpData ? (tempPrice = tmpData[day][0], tmpData[day]) : [tempPrice, 0, [tempPrice, tempPrice], []]]
			})
			.filter(v => v)
			.reduce((p, c:any, j, arr) => {
				return p.map((v, i) => {
					if(i === 1){
						v.push({x: c[0], y: c[1][i], marker:{enabled: (j === arr.length - 1)}});
					}
					else if(i === 0) v.push([c[0]].concat(c[1][i]));
					else v.push({x:c[0], low:c[1][i][0], high: c[1][i][1],
							lowFloor: GenerateRealTradeData.getFloorMinMax(scatterData, {index:c[0], price: c[1][i][0]}, 'min'),
							highFloor:GenerateRealTradeData.getFloorMinMax(scatterData, {index:c[0], price: c[1][i][1]}, 'max')});
					return v;
				})}, [[], [], []]
			);
		return [amount, price, minMax, scatterData];
	}
	type: 'line'
};