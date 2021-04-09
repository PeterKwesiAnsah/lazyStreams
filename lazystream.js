import { PassThrough } from 'stream';
import { createReadStream } from 'fs';
import { createWriteStream } from 'fs';

class readable extends PassThrough {
	constructor(fn) {
		super({ objectMode: false, encoding: 'utf-8' });
		this.readFn = fn;
		this.firstTime = true;
		this.readStream = null;
	}
	_read() {
		if (this.firstTime) {
			this.readStream = this.readFn();
		}

		this.readStream.once('data', (chunk) => {
			this.firstTime = false;
			this.push(chunk.toString());
		});
	}
}

class writable extends PassThrough {
	constructor(fn) {
		super({ objectMode: false, encoding: 'utf-8' });
		this.writeFn = fn;
		this.firstTime = true;
		this.writeStream = null;
	}
	_write(chunk, enc, cb) {
		if (this.firstTime) {
			this.writeStream = this.writeFn();
		}
		this.firstTime = false;
		this.writeStream.write(chunk);

		cb();
	}
}

export const lazystream = {
	readable: readable,
	writable: writable,
};

const Rstream = new lazystream.readable(() =>
	createReadStream('./helloworld.txt')
);
const Wstra = new lazystream.writable(() =>
	createWriteStream('./helloworld2.txt')
);

try {
	Rstream.pipe(Wstra);
} catch (e) {
	console.log(e);
}
