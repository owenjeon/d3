import * as d3 from 'd3';
import {chainD3Style} from 'utils/_util';

class LineLike {
	path:any = {};
	graph;
	curve;
	constructor({curve}){
		this.graph = () => {
			throw 'must be override';
		};;
		this.curve = curve || d3.curveMonotoneX;
	}
	bindData(data){
		this.path.attr('d', this.graph(data));
		return this;
	}
	append(container, cls = ''){
		this.path = container.append('path').attr('class', cls);
		return this;
	}
	appendStyle(...styles){
		this.path.call(chainD3Style, ...styles);
		return this;
	}
}

export class Line extends LineLike {
	constructor({curve}) {
		super({curve});
	}
	readyBinding({x, y}){
		this.graph = d3.line().x(x).y(y).curve(this.curve);
		return this;
	}
}

export class Area extends LineLike {
	constructor({curve}) {
		super({curve});
	}
	readyBinding({x, y0, y1}){
		this.graph = d3.area().x(x).y0(y0).y1(y1).curve(this.curve);
		return this;
	}
}