'use strict';
class Upload
{
	static threadsMax = 5;
	static intervalID = 0;
	static threads = 0;
	static id = 0;
	static queue = [];
	static totalSize = 0;
	static size = [0];

	static ajax(obj, url=location)
	{
		const fd = new FormData();
		for(let n in obj)
			fd.append(n, obj[n]);
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.upload.onprogress = event =>
		{
			if(obj.file && obj.file.id)
				this.progress(obj.file.id, event.loaded/event.total, event.loaded);
			else if(obj.id)
				this.progress(obj.id, event.loaded/event.total, event.loaded);
		};
		xhr.onload = () =>
		{
			if(xhr.status == 200)
			{
				--this.threads;
				if(obj.file && obj.file.id && obj.file.size)
					this.progress(obj.file.id, 2, obj.file.size);
				else if(obj.id && obj.size)
					this.progress(obj.id, 2, obj.size);
			}
		};
		xhr.send(fd);
	}

	static process()
	{
		this.intervalID = setInterval(() =>
		{
			while(this.intervalID > 0 && this.threads < this.threadsMax)
			{
				if(this.queue.length)
				{
					this.ajax({'file':this.queue.shift()});
					++this.threads;
				}
				else
				{
					clearInterval(this.intervalID);
					this.intervalID = 0;
				}
			}
		}, 1000);
	}

	static progress(id, p, size, text)
	{
		if(id > 0 && p >= -1 && p <= 2)
		{
			const headOutput = document.querySelector('#progress>div:first-child output');
			const headProgress = document.querySelector('#progress>div:first-child progress');
			const body = document.getElementById('progress').lastElementChild;
			let div = document.getElementById('progress-'+id);
			if(p == 0 && size == 0 && text)
			{
				if(div)
					div.remove();
				div = document.createElement('div');
				div.setAttribute('id', 'progress-'+id);
				div.classList.add('wait');
				div.innerHTML = '<p>'+id+': '+esc(text)+'</p><progress value="0"></progress>';
				body.append(div);
				headProgress.style.display = '';
				body.scrollTop = body.scrollTopMax;
				body.parentElement.style.display = '';
			}
			else if(p == -1)
			{
				div.classList.add('fail');
				div.classList.remove('wait');
				div.lastElementChild.outerHTML = '<p>Файл привысил допустимый размер '+Math.min(max_filesize, max_postsize)/1024**2+' МБ</p>';
			}
			else if(size >= 0)
			{
				this.size[id] = size;
				const sizeMB = (this.size.reduce((a, b) => a+b, 0)/1024**2).toFixed(2)+' МБ';
				const totalSizeMB = (this.totalSize/1024**2).toFixed(2)+' МБ';
				headOutput.innerHTML = this.id-this.queue.length-this.threads+' из '+this.id+' ('+sizeMB+' из '+totalSizeMB+')';
				headProgress.value = this.size.reduce((a, b) => a+b, 0)/this.totalSize;
				div.classList.remove('wait');
				if(p == 2)
				{
					if(this.threads == 0)
					{
						headOutput.innerHTML = 'завершены '+this.id+' ('+totalSizeMB+')';
						headProgress.style.display = 'none';
					}
					div.classList.add('done');
					div.lastElementChild.remove();
				}
				else
					div.lastElementChild.value = p;
			}
		}
	}

	static processInputHandler(files, form)
	{
		for(let i=0; i < files.length; ++i)
		{
			files[i].id = ++this.id;
			this.size.push(0);
			this.progress(files[i].id, 0, 0, files[i].name+' ('+(files[i].size/1024**2).toFixed(2)+' МБ)');
			if(files[i].size > 0 && files[i].size < max_filesize && files[i].size < max_postsize)
			{
				this.totalSize += files[i].size;
				this.queue.push(files[i]);
			}
			else
				this.progress(files[i].id, -1);
		}
		form.reset();
		if(this.intervalID == 0 && this.queue.length)
			this.process();
	}

	static processDropHandler(event)
	{
		event.preventDefault();
		for(let i=0; i < event.dataTransfer.items.length; ++i)
		{
			if(event.dataTransfer.items[i].kind == 'file')
			{
				const file = event.dataTransfer.items[i].getAsFile();
				file.id = ++this.id;
				this.size.push(0);
				this.progress(file.id, 0, 0, file.name+' ('+(file.size/1024**2).toFixed(2)+' МБ)');
				if(file.size > 0 && file.size < max_filesize && file.size < max_postsize)
				{
					this.totalSize += file.size;
					this.queue.push(file);
				}
				else
					this.progress(file.id, -1);
			}
		}
		if(this.intervalID == 0 && this.queue.length)
			this.process();
	}

	static plainDropHandler(event)
	{
		event.preventDefault();
		let files = {};
		let size = 0;
		for(let i=0, n=0; i < event.dataTransfer.items.length && n < max_files; ++i)
		{
			if(event.dataTransfer.items[i].kind == 'file')
			{
				const file = event.dataTransfer.items[i].getAsFile();
				if(file.size > 0 && file.size < max_filesize && file.size+size < max_postsize)
				{
					size += file.size;
					files['files['+i+']'] = file;
					++n;
				}
			}
		}
		if(JSON.stringify(files) != JSON.stringify({}))
		{
			files.id = ++this.id;
			files.size = size;
			this.size.push(0);
			this.totalSize += size;
			this.progress(files.id, 0, 0, 'Выгрузка ('+(size/1024**2).toFixed(2)+' МБ)');
			this.ajax(files);
			++this.threads
		}
	}

	static showToggle(doc)
	{
		doc.style.display = doc.style.display ?'' :'none';
	}
}

window.addEventListener('dragover', e =>
{
	if(!(e.target.classList.contains('drop') || (e.target.parentElement && e.target.parentElement.classList.contains('drop'))))
		e.dataTransfer.dropEffect = 'none';
});