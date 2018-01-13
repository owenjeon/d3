import * as d3 from 'd3';
import {chainD3Style} from 'utils/_util';

class LineLike {
	path:any = {};
	graph;
	curve;
	constructor({curve}){
		this.graph = () => {
			throw 'must be override';
		};
		this.curve = curve || d3.curveMonotoneX;
	}
	bindData(data){
		this.path.datum(data);
		return this;
	}
	draw(){
        this.path.attr('d', this.graph);
        return this;
	}
	append(container, cls = ''){
		this.path = container.append('path').attr('class', cls);
		return this;
	}
	appendStyle(...styles){
        this.path = this.path.call(chainD3Style, ...styles);
		return this;
	}
	transition(transition, duration=5000, delay= 0){
        this.path.transition().call(transition, duration, delay).attr('d', this.graph);
		return this;
	}
}

export class Line extends LineLike {
	constructor({curve}) {
		super({curve});
        this.graph = d3.line().curve(this.curve);
	}
	readyBinding({x, y}){
		this.graph.x(x).y(y);
		return this;
	}
}

export class Area extends LineLike {
	constructor({curve}) {
		super({curve});
        this.graph = d3.area().curve(this.curve)
	}
	readyBinding({x, y0, y1}){
		this.graph.x(x).y0(y0).y1(y1);
		return this;
	}
}