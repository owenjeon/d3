import * as d3 from 'd3';
import {_pipe} from 'utils/_util';

export class Axis {
	scale;
	axis;
    ele;
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

    setEle(element, cls, addFn?){
        this.ele = _pipe(() => element.append('g').attr('class', cls), addFn)();
        return this;
	}
    transition(transition, duration=5000, delay= 0){
        this.ele.transition().call(transition, duration, delay).call(this.axis);
        return this;
    }
	render() {
        this.ele.call(this.axis);
		return this;
	}
}