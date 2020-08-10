var docBlocksModal = null
var injectHTML = null
// setTimeout( () => {
// 	document.body.addEventListener('keyup', onKeyPress, false);
// 	document.body.addEventListener('click', onClick,false)
// },1000)


const waitUntilElementExists = (selector, callback) => {
        const el = document.querySelector(selector);
        if (el){
        return callback(el);
        }
        setTimeout(() => waitUntilElementExists(selector, callback), 500);
}

waitUntilElementExists('.docs-texteventtarget-iframe', () => {
	editor = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument.querySelectorAll('[contenteditable=true]')[0]
	editor.addEventListener('keydown', onKeyPress, false);
	document.body.addEventListener('click', onClick,false)
	document.addEventListener('copy', function(e) {
		if (injectHTML != null) {
			e.clipboardData.setData('text/html', injectHTML);
			console.log("Have something to insert ", injectHTML);
			injectHTML=null	
			e.preventDefault()
			setTimeout(() => { pasteClipboard() },30)
		}	
	})
})

// ================================================


//If clicked outside the modal need to close the modal.
const onClick = (e) => {
	if (docBlocksModal && e.target && e.target.id!='docBlocksModal') {
		docBlocksModal.style.display='none'
	}
}
trigger_key = 191; // slash 
const onKeyPress = (e) => {
	if (e.keyCode == trigger_key) {
		if (docBlocksModal != null) {
			toggleModal()
		}
		else {
			loadDocBlocksModal()			
			e.preventDefault()
		}
	}
	positionModal()
}
const toggleModal = () => {
	if (docBlocksModal != null) {
		docBlocksModal.style.display = (docBlocksModal.style.display==='none') ? 'block' : 'none'
	}
}
const positionModal = () => {
	let c = document.getElementsByClassName('kix-cursor-caret')[0]
	let rect =  c.getBoundingClientRect()
	if (docBlocksModal) {
		docBlocksModal.style.top=rect.top + 10 +  'px'
		docBlocksModal.style.left=rect.left + 10 +  'px'
	}
}
const loadDocBlocksModal = () => {
	if (docBlocksModal!=null) return   //can only do this one time.
	
	let cssUrl = chrome.extension.getURL("css/bootstrap.min.css")
//	let jsUrl = chrome.extension.getURL("js/modal.js")

	fetch(chrome.extension.getURL('html/modal.html'))
	.then(response => response.text())
	.then(data => {
		data = data.replace('../css/bootstrap.min.css', cssUrl)
	//	data = data.replace('../js/modal.js', jsUrl)

		docBlocksModal = document.createElement('div');
		const shadowRoot = docBlocksModal.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = data

		docBlocksModal.style.position='absolute'
		docBlocksModal.style.top='100px'
		docBlocksModal.style.left='100px'
		docBlocksModal.style.zIndex='10000'
		positionModal()
		docBlocksModal.id='docBlocksModal'
		document.body.appendChild(docBlocksModal);
		shadowRoot.addEventListener( 'click', onModalClick )

		// fetch(jsUrl)
		// .then(response => response.text())
		// .then(data => {
		// 	const script = document.createElement('script')
		// 	script.textContent = data
		// 	shadowRoot.appendChild(script)
		// })


	}).catch(err => {
		console.log("Error!", err);
	})
}

//have to clean this up.
const onModalClick = (e) => {
	let options = ['link','photo','divider']
	let id = null
	let elm = e.target
	for (var i = 0; i < 5; i++) {	
		if (elm && elm.id) { id = elm.id }
		else if (elm) { 
			elm = elm.parentElement
		}
	}
	docBlocksModal.style.display='none'
	if (id=='divider') {
		injectHTML = '<hr><br>'
		document.execCommand("copy");
	}
	else if (id=='link') {
		injectHTML='<a href="https://twitter.com/">Twitter</a>'
		document.execCommand("copy");
	}
	else if (id=='photo') {
		injectHTML='<img src="https://i.pinimg.com/564x/cf/9e/ac/cf9eace4ae379df9b506a9ec0f0c4cd6.jpg">'
		document.execCommand("copy");
	}
	//console.log("id is ", id);
	e.preventDefault()
}

const triggerMouseEvent = (node, eventType)=> {
      var clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent(eventType, true, true);
      node.dispatchEvent(clickEvent);
  }

const pasteClipboard = () => {
	let m = document.querySelectorAll('span.goog-menuitem-accel')
	let target = Array.from(m).filter(i => i.getAttribute('aria-label') == '⌘V' )[0]
	triggerMouseEvent(target, "mouseover")
	triggerMouseEvent(target, "mousedown")
	triggerMouseEvent(target, "mouseup")
}
