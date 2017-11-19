export const _pipe = (...params) => {
	const fns = params.filter(v => typeof v === 'function');
	return (arg?) => {
		return fns.reduce((args, fn) => fn(args), arg)
	}
};

export const chainD3Style = function(selection, ...arr) {
	while(arr.length) {
		selection.style(...(arr.shift()));
	}
};

export const makeDate = (y=2017, m=1, d=1) => Date.UTC(y || 2017, m-1, 1);

export const priceToKmoney = (price, attachTag?) => {
    if (!price) {
        return 0;
    } else if (price < 10000) {
        return price.toString().replace(/(\d)(\d{3})$/, '$1,$2')
    } else {
        var strUk = "억";
        if (attachTag) {
            strUk = "<span>" + strUk + "</span>";
        }
        return Math.floor(price / 10000) + strUk + (priceToKmoney(price % 10000) || '');
    }
}