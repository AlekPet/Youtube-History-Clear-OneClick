// ==UserScript==
// @name         Youtube History Clear OneClick
// @namespace    https://github.com/AlekPet/Youtube-History-Clear-OneClick
// @version      2022-11-19
// @description  Clear history on Youtube
// @author       AlekPet
// @match        https://www.youtube.com/feed/history
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at document-end
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    const globalStylesHistory = `
ytd-thumbnail-overlay-resume-playback-renderer, .text-wrapper.ytd-video-renderer{
z-index: 0;
}
#pop_list_history_del {
    background: linear-gradient(2deg, #f97979, #ff3636);
    color: white;
    padding: 3px 30px;
    margin: 6px auto 0 auto;
    border: none;
    cursor: pointer;
    transition: 1s all;
}
#pop_list_history_del:hover{
    background: linear-gradient(2deg, #f9e979, #ffdd36)
}
.panel_cls{
    border-top: 1px solid var(--yt-spec-10-percent-layer);
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: var(--yt-spec-text-secondary);
    font-family: "Roboto","Arial",sans-serif;
    font-size: 1.4rem;
    line-height: 2rem;
    font-weight: 500;
    padding: 13px;
}
.panels_histories{
display: flex;
flex-direction: row;
justify-content: space-evenly;
}
#pop_list_history{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 1;
    background: #ffffff;
    width: 40vw;
    border: 2px solid #e1e1e1;
    padding: 10px;
    border-radius: 6px;
    box-shadow: 1px 1px 4px #c0c0c073;
}
.pop_list_history_close{
    position: absolute;
    top: -9px;
    left: 99%;
    background: snow;
    border: 1px solid silver;
    border-radius: 8px;
    text-align: center;
    width: 15px;
    height: 15px;
    font-size: 10px;
    cursor: pointer;
    user-select: none;
}
.li_history_tag{
display: flex;
    align-content: center;
    justify-content: space-between;
    background: snow;
    padding: 5px;
    margin: 4px 0;
    border: 1px solid #f37900;
    border-radius: 6px;
}
#pop_list_history_body{
overflow-y: auto;
max-height: 400px;
min-height: 30px;
}
#pop_list_history_actions{
text-align: center;
}
`

    function mE(p){
        const tag = p.tag,
              attr = p.attr,
              text = p.text || null,
              value = p.value || null,
              innerText = p.innerText || null

        let element = document.createElement(tag)

        if(text) element.textContent = text
        if(value) element.value = value
        if(innerText) element.innerText = value

        for(let a in attr){
            element.setAttribute(a, attr[a])
        }
        return element
    }

    class HisoryClear {
        constructor(){
            this.func_getlist = []
            // Styles
            const sty = mE({tag:'style', text:globalStylesHistory})
            document.body.appendChild(sty)
        }

        makepanel(){
            let panel_cls = mE({tag:'div', attr:{class:'panel_cls'}}),
                panel_fil = mE({tag:'div', attr:{class:'panels_histories'}}),
                panel_count = mE({tag:'div', attr:{class:'panels_histories'}}),
                panel_buttons = mE({tag:'div', attr:{class:'panels_histories'}}),
                pop_list_history_actions = mE({tag:'div', attr:{id:'pop_list_history_actions'}})

            this.pop_list_history = mE({tag:'div', attr:{id:'pop_list_history', style:'display:none;'}})

            this.pop_list_history_body = mE({tag:'div', text:'Данные отсутствуют...', attr:{id: 'pop_list_history_body'}})
            this.pop_list_history_del = mE({tag:'button', text: "Удалить", attr:{id: 'pop_list_history_del'}})

            this.filtertext_l = mE({tag:'label', text: "По тексту: ", attr:{for:'filtertext'}})
            this.filtertext = mE({tag:'input', value: "", attr:{type:'text', id: 'filtertext'}})

            this.how_many_l = mE({tag:'label', text: "Кол-во: ", attr:{for:'how_many'}})
            this.how_many_c = mE({tag:'input', attr:{type:'checkbox', id:'how_many_check'}})
            this.how_many = mE({tag:'input', value: 5, attr:{type:'number', 'min':1, id:'how_many', disabled: true}})

            this.cls_button = mE({tag:'button', text: "Очистить историю", attr:{style:'width:40%;'}})
            this.view_button = mE({tag:'button', text: "Список", attr:{style:'width:40%;'}})

            this.pop_list_history_close = mE({tag:'div', text: "X", attr:{title:'Закрыть',class:'pop_list_history_close'}})

            panel_fil.appendChild(this.filtertext_l)
            panel_fil.appendChild(this.filtertext)

            panel_count.appendChild(this.how_many_l)
            panel_count.appendChild(this.how_many)
            panel_count.appendChild(this.how_many_c)

            panel_buttons.appendChild(this.cls_button)
            panel_buttons.appendChild(this.view_button)

            panel_cls.appendChild(panel_fil)
            panel_cls.appendChild(panel_count)
            panel_cls.appendChild(panel_buttons)

            pop_list_history_actions.appendChild(this.pop_list_history_del)

            this.pop_list_history.appendChild(this.pop_list_history_close)
            this.pop_list_history.appendChild(this.pop_list_history_body)
            this.pop_list_history.appendChild(pop_list_history_actions)

            const secondpanel = document.querySelector('#secondary #contents').parentElement

            secondpanel.appendChild(panel_cls)
            secondpanel.appendChild(this.pop_list_history)

            // Events
            this.how_many.addEventListener('input', ()=> {
                this.cls_button.textContent = `Очистить историю [${this.how_many.value}]`
            })

            this.how_many_c.addEventListener('change', ()=> {
                this.how_many.disabled = !this.how_many_c.checked
            })

            this.cls_button.addEventListener('click', this.clear.bind(this, null))
            this.pop_list_history_del.addEventListener('click', this.clear_viewlist.bind(this))

            this.view_button.addEventListener('click', this.list_view.bind(this))
            this.pop_list_history_close.addEventListener('click', this.showhide.bind(this, this.pop_list_history))
        }

        showhide(element){
            element.style.display = (!element.style.display || element.style.display == 'block') ? 'none': 'block'
        }

        clear_viewlist(){
            let list_checked = this.pop_list_history_body.querySelectorAll('#ul_list_view > li input')
            list_checked = Array.from(list_checked)
                .map((elem, idx)=>({index:idx,item:elem}))
                .filter((elem)=>elem.item.checked).map((elem)=>elem.index)

            list_checked = this.func_getlist.filter((elem, idx)=>list_checked.includes(idx))
            this.clear(list_checked)
        }

        list_view(){
            this.func_getlist = this.getlist()

            this.pop_list_history_body.innerHTML = ''
            this.showhide(this.pop_list_history)

            if(this.how_many_c.checked) this.func_getlist = this.func_getlist.splice(0, +this.how_many.value)

            const box_item = mE({tag:'ul', attr:{id:'ul_list_view'}})
            for(let item of this.func_getlist){
                const li = mE({tag:'li', attr:{class:'li_history_tag'}}),
                      title = mE({tag:'span', text: item.text, attr:{}}),
                      checked = mE({tag:'input', attr:{type:'checkbox', checked:true}})

                li.appendChild(title)
                li.appendChild(checked)

                box_item.appendChild(li)
                this.pop_list_history_body.appendChild(box_item)
            }
        }

        getlist(){
            let result = [],
                collections = [],
                text = this.filtertext.value,
                title_wrapper = document.querySelectorAll('ytd-two-column-browse-results-renderer.style-scope.ytd-browse.grid.grid-6-columns #contents #contents > ytd-video-renderer:not([is-dismissed]) #title-wrapper')

            title_wrapper.forEach((t)=>{
                let vid_text = t.children[0].innerText,
                    vid_butdel = t.children[1].querySelector('button')

                collections.push({text:vid_text,but_del:vid_butdel})
            })

            if(text !== '' && !/^\s*$/g.test(text)){
                const text_ = text.split(' ')

                collections.forEach((collection_data)=>{
                    const textValue = collection_data.text.toLowerCase()
                    for(let t of text_){
                        if(textValue.includes(t.toLowerCase())){
                            result.push({text:collection_data.text, but_del:collection_data.but_del})
                        }
                    }
                })
            } else {
                result = collections
                alert(`Поле фильтра пустое, используется вся история на странице равная: ${result.length}`)
            }

            return result
        }

        async clear(list=null){

            let func_getlist = list ? list : this.getlist()

            if(!list && this.how_many_c.checked) func_getlist = func_getlist.splice(0, +this.how_many.value)
            console.log(func_getlist)
            if(confirm(`Вы дейстивтельно хотите удалить из истории ${func_getlist.length}?
${func_getlist.map((x)=>`● ${x.text}`).slice(0,35).join('\n')}'\n...`)){
                for(let butdel of func_getlist){
                    await butdel.but_del.click()
                }
            }
        }
    }

    function start(){
        setTimeout(()=>{
            const list = document.querySelectorAll('ytd-two-column-browse-results-renderer.style-scope.ytd-browse.grid.grid-6-columns #contents #contents #menu ytd-menu-renderer.style-scope #top-level-buttons-computed button')
            if(list.length){
                console.log('%cИстория загрузилась...', "color: limegreen;font-weight: bold;")
                let hc = new HisoryClear()
                hc.makepanel()
                return
            } else {
                console.log('%cИстория еще не загрузилась, иду на повтор...', "color: blue;font-weight: bold;")
                start()
            }
        }, 500)
    }
    start();
})();
