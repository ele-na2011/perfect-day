guideBtn.onclick   = () => guide.classList.toggle('open');
grabber.onclick    = () => backpack.classList.toggle('closed');
barFill.style.width = score + '%';
barFill.className  = 'bar-fill ' + (score >= 80 ? '' : score >= 40 ? 'mid' : 'low');
