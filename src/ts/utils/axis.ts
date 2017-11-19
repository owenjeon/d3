import * as d3 from 'd3';
import {_pipe} from 'utils/_util';

export class Axis {
	scale;
	axis;
	g;
	constructor(type){
        this.scale = d3[type]()
	}
	setDomain(domain, range) {
        this.scale = this.scale.domain(domain).range(range);
		return this;
	}

	setAxis(position, addFn) {
		this.axis = _pipe(d3[position], addFn)(this.scale);
		return this;
	}

	render(container, cls, addFn?) {
        this.g = _pipe(() => container.append('g').attr('class', cls), addFn)().call(this.axis);
		return this;
	}
}