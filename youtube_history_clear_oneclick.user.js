// ==UserScript==
// @name         Youtube History Clear OneClick
// @namespace    https://github.com/AlekPet/Youtube-History-Clear-OneClick
// @version      2023-04-29
// @description  Clear history on Youtube
// @author       AlekPet
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at document-end
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    var debug = false,
        LS_DataOneClick = {},
        // - Selectors
        buttonsDeletes = 'ytd-two-column-browse-results-renderer.style-scope.ytd-browse.grid.grid-6-columns #contents #contents #menu ytd-menu-renderer.style-scope #top-level-buttons-computed button',
        buttonsNotDismiss = 'ytd-two-column-browse-results-renderer.style-scope.ytd-browse.grid.grid-6-columns #contents #contents > ytd-video-renderer:not([is-dismissed])',
        channelNameSelector = '#byline-container a',
        ytd_browse = 'ytd-browse',
        // - end Selectors
        // -- Languages -- //
        defaultLang = 'ru',
        langs = {
            ru:{
                search_text: 'По тексту:',
                search_text_placeholder: 'Введите слова через пробел...',
                template: 'Шаблон:',
                count_del: 'Кол-во:',
                count_del_title: 'Удалить определеное кол-во элементов в истории',
                not_select_template: 'Не выбрано',
                //
                words_filter: 'Слов для фильтрации: ',
                not_include_words: 'Не включены: ',
                not_include_words_title: 'Не включеные слова: ',
                //
                add_pattern: 'Добавить фильтр',
                edit_pattern: 'Изменить',
                del_pattern: 'Удалить',
                save_pattern: 'Сохранить',
                close: 'Закрыть',
                //
                clear_history: 'Очистить историю',
                view_history_list_title: 'Показать список',
                view_history_list: 'Список',
                //

                modal_not_found_filter_empty: 'Нечего не найдено, список удовлетворяющий фильтру пуст!',
                modal_no_data: 'Данные отсутствуют...',
                modal_del_filter: 'Хотите удалить выделенный фильтр?',
                modal_error_empty: 'Пустое поле или меньше 3 символов!',
                modal_confirm: 'Вы дейстивтельно хотите удалить из истории ',
                modal_info_message: ['Поле фильтра пустое, используется вся история на странице равная:', '\nБудет выведенно ',' элементов, т.к. выбрано ограничение!'],
                modal_not_get_list: "Список каналов получить не удалось",
                modal_filter_channels_cheched_info: `Вы выбрали, что фильтр содержит элемент(ы) "Канал(ы)",
но поле не содержит каналы в соостветствии с правилами!
Фильтр с каналами должен содержать слова заключенные в кавычки и разделенные пробелом.
Пример: "Tim Janis" "JenniferConnelly80s"
Фильтр, как каналы будет отключен!`,
                modal_info_channelfast_add: `Имя канала не найдено, или текст фильтра пуст, или недействителен, или канал уже существует в тексте фильтра!`
            },
            en:{
                search_text: 'By text:',
                search_text_placeholder: 'Enter words separated by spaces...',
                template: 'Template:',
                count_del: 'Count:',
                count_del_title: 'Delete certain number of items in history',
                not_select_template: 'Not selected',
                //
                words_filter: 'Words to filter: ',
                not_include_words: 'Not included: ',
                not_include_words_title: 'Not included words: ',
                //
                add_pattern: 'Add filter',
                edit_pattern: 'Edit',
                del_pattern: 'Delete',
                save_pattern: 'Save',
                close: 'Close',
                //
                clear_history: 'Clear history',
                view_history_list_title: 'Show List',
                view_history_list: 'List',
                //

                modal_not_found_filter_empty: 'No results were found, the list matching the filter is empty!',
                modal_no_data: 'No data...',
                modal_del_filter: 'Do you want to remove the selected filter?',
                modal_error_empty: 'Empty field or less than 3 characters!',
                modal_confirm: 'Are you sure you want to remove from history ',
                modal_info_message: ['The filter field is empty, the entire history on the page is used equal to:', '\nIt will display ',' elements, because restriction selected!'],
                modal_not_get_list: "Failed to get channel list",
                modal_filter_channels_cheched_info: `You have chosen that the filter contains the element(s) "Channel(s)",
but the field does not contain channels according to the rules!
The channel filter must contain words enclosed in quotation marks and separated by spaces.
Example: "Tim Janis" "JenniferConnelly80s"
Filter how channels will be disabled!`,
                modal_info_channelfast_add: `Channel name not found or filter text empty, or not valid, or channel already exists in the filter text!`
            },
        },
        langs_select = langs[navigator.language.slice(0,2) == defaultLang ? defaultLang : 'en'],
        // -- end Languages -- //

        // -- Styles -- //
        globalStylesHistory = `
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
#pop_selectItemBox{
    position: fixed;
    top: 50%;
    left: 50%;
    width: 30%;
    background: #c0c0c0;
    transform: translate(-50%,-50%);
    text-align: center;
    opacity: 0.9;
}
.selectItemInfo{
display: flex;
background: black;
justify-content: space-around;
}
.selectItemSave{
color: white;
    margin: 5px;
    width: 50%;
    padding: 6px;
    background: linear-gradient(358deg, #06d900, transparent);
    border: 1px solid #079d07;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    text-transform: uppercase;
}
.add_channel_btn{
background: linear-gradient(45deg, #11ab05, #07efa4);
    position: relative;
    width: 16px;
    height: 16px;
    text-align: center;
    color: white;
    font-weight: 700;
    transition: background .7s, transform .8s;
}
.add_channel_btn:hover{
    background: linear-gradient(45deg, #19a58a, #07cfef);
    transform: scale(1.1)
}
`
    // -- end Styles -- //



    function log(text, style=''){
        if(debug) console.log(text, style)
    }

    function LS_save(){
        try{
            let save_tmp = JSON.stringify(LS_DataOneClick);

            if(save_tmp && save_tmp.length>0){
                GM_setValue("LS_DataOneClick", save_tmp)
            }
        } catch(e){
            throw new Error("Error: Save data to LocalStorage!")
        }
    }

    function LS_load(){
        let ls_data = GM_getValue('LS_DataOneClick')
        LS_DataOneClick = ls_data ? JSON.parse(ls_data): {
            items:[],
            options:{}
        }

    }

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


            this.panel_cls = document.querySelector('.panel_cls')
            if(!this.panel_cls){

                // Styles
                const sty = mE({tag:'style', text:globalStylesHistory})
                document.body.appendChild(sty)

                // Create elements
                this.makepanel()

                // Events
                this.setEvents()

                // Buttons add to filter channels
                this.channelAddToFilter()
            }
        }



        returnActiveFilter(arrayObj, attr, value){
            return arrayObj.filter((item)=> item[attr] == value)
        }

        changeAttribute(elem, attr, val, del=false){
            if(!del){
                elem.setAttribute(attr, val)
            } else {
                elem.removeAttribute(attr)
            }
        }

        checkChannelExist(arr, channel_name){
            return arr.some((c)=> c === `"${channel_name}"`)
        }

        channelAddToFilter(){
            const wrapper = document.querySelectorAll(buttonsNotDismiss+' #meta #metadata')
            wrapper.forEach((w)=>{
                if(!w.querySelector('.channel_container_data')){
                    let channel_container_data = mE({tag:'div', attr:{title:'Add',id:'byline-container', class:'channel_container_data style-scope ytd-video-meta-block'}}),
                        add_channel_btn = mE({tag:'div', text: '+', attr:{class:'add_channel_btn'}}),
                        sep = mE({tag:'div', text: '•', attr:{id:'separator', class:"style-scope ytd-video-meta-block"}})

                    channel_container_data.addEventListener('click', (e)=>{
                        e.stopPropagation()
                        let channelName = w.children[0]?.querySelector(channelNameSelector)?.textContent,
                            filterChannelsList = this.filtertext.value.match(/"(\.|[^"'])*"/g) || []

                        if(!channelName || this.checkChannelExist(filterChannelsList, channelName)){
                            alert(langs_select.modal_info_channelfast_add)
                            return
                        }

                        if(!this.filtertext?.dataset?.channels && !this.filtertext.dataset.channels){
                            this.filtertext.style.background = "limegreen"
                            this.filtertext.dataset.channels = true
                        }

                        filterChannelsList.push(`"${channelName}"`)
                        this.filtertext.value = filterChannelsList.join(' ')

                    });

                    channel_container_data.appendChild(sep)
                    channel_container_data.appendChild(add_channel_btn)


                    w?.appendChild(channel_container_data)
                }
            })
        }

        updateSelectItem(){
            this.selectItem.innerHTML = ''

            this.selectItem.appendChild(mE({tag:'option', value:'None', text:langs_select.not_select_template, attr:{}}))
            if(LS_DataOneClick.hasOwnProperty('items') && LS_DataOneClick.items.length){
                for(let [key,item] of LS_DataOneClick.items.entries()){
                    let option = mE({tag:'option', text:item.text, value:`f_item_${key}`, attr:{}})
                    this.selectItem.appendChild(option)
                    if(item.active){
                        this.selectItem.selectedIndex = key+1
                    }
                }
            } else {
                this.selectItem.selectedIndex = 0
            }
        }

        get_infoText(element, count=3){
            let splitEl = element.replace(/\s{1,}/ig,' ').split(' ')
            return `<p style='color:limegreen;'>${langs_select.words_filter} ${splitEl.filter((t)=>t.length>=count).length}</p>
                    <p style='color:red;' title='${langs_select.not_include_words_title} \n${splitEl.filter((t)=>t.length<=count).join(' ')}'>${langs_select.not_include_words} ${splitEl.filter((t)=>t.length<count).length}</p>`
        }

        makepanel(){
            let panel_fil = mE({tag:'div', attr:{class:'panels_histories'}}),
                panel_count = mE({tag:'div', attr:{class:'panels_histories'}}),
                panel_buttons = mE({tag:'div', attr:{class:'panels_histories'}}),
                panel_selectItem = mE({tag:'div', attr:{class:'panels_histories'}}),
                pop_list_history_actions = mE({tag:'div', attr:{id:'pop_list_history_actions'}})

            this.panel_cls = mE({tag:'div', attr:{class:'panel_cls'}})
            this.selectItemLabel = mE({tag:'span', text: langs_select.template, attr:{id:'pop_select_item', style:''}})
            this.selectItem = mE({tag:'select', attr:{id:'pop_select_item', style:'width: 60%;'}})
            this.selectItemAdd = mE({tag:'button', text: "+", attr:{id: 'pop_selectItemAdd', title:langs_select.add_pattern}})
            this.selectItemRem = mE({tag:'button', text: "-", attr:{id: 'pop_selectItemRem', title:langs_select.del_pattern, style:'background: palevioletred;'}})
            this.selectItemEdit = mE({tag:'button', text: "E", attr:{id: 'pop_selectItemEdit', title:langs_select.edit_pattern}})

            this.selectItemBox = mE({tag:'div', attr:{id: 'pop_selectItemBox', style:'display:none;'}})
            this.selectItemTextArea = mE({tag:'textarea', attr:{id: 'pop_selectItemTextArea', style:"width: 99%;min-height: 200px;"}})
            this.selectItemSave = mE({tag:'button', text: langs_select.save_pattern, attr:{id: 'pop_selectItemSave', title:langs_select.save_pattern,class:'selectItemSave'}})
            this.selectItemInfo = mE({tag:'div', attr:{id: 'pop_selectItemInfo', class:'selectItemInfo'}})
            this.selectItemBoxClose = mE({tag:'div', text:'X', attr:{id: 'pop_selectItemBoxClose', title:langs_select.close, class:'pop_list_history_close'}})
            this.selectItemBox_body = mE({tag:'div', attr:{class:'pop_selectItemBox_body'}})

            this.itIsChannels = mE({tag:'input', attr:{type:'checkbox', id:'it_is_channels', title:"Channels List"}})
            this.itIsChannels_label = mE({tag:'label', text:"Channels List", attr:{style:'margin-right: 10%;',class:'pop_selectItemBox_body', for:'it_is_channels'}})

            this.selectItemBox_body.appendChild(this.itIsChannels)
            this.selectItemBox_body.appendChild(this.itIsChannels_label)
            this.selectItemBox_body.appendChild(this.selectItemSave)

            this.selectItemBox.appendChild(this.selectItemTextArea)
            this.selectItemBox.appendChild(this.selectItemBox_body)

            this.selectItemBox.appendChild(this.selectItemBoxClose)
            this.selectItemBox.appendChild(this.selectItemInfo)

            this.pop_list_history = mE({tag:'div', attr:{id:'pop_list_history', style:'display:none;'}})

            this.pop_list_history_body = mE({tag:'div', text:langs_select.modal_no_data, attr:{id: 'pop_list_history_body'}})
            this.pop_list_history_del = mE({tag:'button', text: langs_select.del_pattern, attr:{id: 'pop_list_history_del'}})

            this.filtertext_l = mE({tag:'label', text: langs_select.search_text, attr:{for:'filtertext'}})
            this.filtertext = mE({tag:'textarea', value: "", attr:{id: 'filtertext', autocomplete:'on', placeholder:langs_select.search_text_placeholder, style:'width: 75%;resize: vertical;'} })

            this.how_many_l = mE({tag:'label', text: langs_select.count_del, attr:{for:'how_many', title:langs_select.count_del}})
            this.how_many_c = mE({tag:'input', attr:{type:'checkbox', id:'how_many_check', title:langs_select.count_del_title}})
            this.how_many = mE({tag:'input', value: 5, attr:{type:'number', 'min':1, id:'how_many', disabled: true}})

            this.cls_button = mE({tag:'button', text: langs_select.clear_history, attr:{style:'width:40%;'}})
            this.view_button = mE({tag:'button', text: langs_select.view_history_list, attr:{style:'width:40%;', title:langs_select.view_history_list_title}})

            this.pop_list_history_close = mE({tag:'div', text: "X", attr:{title:langs_select.close,class:'pop_list_history_close'}})

            panel_fil.appendChild(this.filtertext_l)
            panel_fil.appendChild(this.filtertext)

            panel_count.appendChild(this.how_many_l)
            panel_count.appendChild(this.how_many)
            panel_count.appendChild(this.how_many_c)

            panel_buttons.appendChild(this.cls_button)
            panel_buttons.appendChild(this.view_button)

            panel_selectItem.appendChild(this.selectItemLabel)
            panel_selectItem.appendChild(this.selectItem)
            panel_selectItem.appendChild(this.selectItemAdd)
            panel_selectItem.appendChild(this.selectItemEdit)
            panel_selectItem.appendChild(this.selectItemRem)

            this.updateSelectItem()

            this.panel_cls.appendChild(panel_fil)
            this.panel_cls.appendChild(panel_selectItem)
            this.panel_cls.appendChild(panel_count)
            this.panel_cls.appendChild(panel_buttons)
            this.panel_cls.appendChild(this.selectItemBox)

            pop_list_history_actions.appendChild(this.pop_list_history_del)

            this.pop_list_history.appendChild(this.pop_list_history_close)
            this.pop_list_history.appendChild(this.pop_list_history_body)
            this.pop_list_history.appendChild(pop_list_history_actions)

            const secondpanel = document.querySelector('#secondary #contents').parentElement

            secondpanel.appendChild(this.panel_cls)
            secondpanel.appendChild(this.pop_list_history)
        }

        setEvents(){
            this.selectItem.addEventListener('change', (ev)=>{
                let option = this.selectItem.options[this.selectItem.selectedIndex]
                if(option.value != 'None'){
                    this.filtertext.value = option.text

                    if(LS_DataOneClick.hasOwnProperty('items') && LS_DataOneClick.items.length){
                        const findChannels = LS_DataOneClick.items.filter((item) => item.hasOwnProperty('channels') && item.text === option.text)
                        this.filtertext.style.background = findChannels[0]?.channels ? "limegreen" : ''
                        this.filtertext.dataset.channels = findChannels[0]?.channels
                    }

                } else {
                    this.filtertext.value = ''
                    this.filtertext.style.background = ''
                    delete this.filtertext.dataset.channels
                }
            })

            // Show box to add new item filter
            this.selectItemAdd.addEventListener('click', ()=>{
                if(confirm(langs_select.add_pattern+'?: ')){
                    this.selectItemTextArea.value = this.filtertext.value
                    this.selectItemSave.textContent = langs_select.save_pattern
                    this.selectItemSave.title = langs_select.save_pattern
                    this.itIsChannels.checked = (this.filtertext?.dataset?.channels && this.filtertext.dataset.channels) ? true : false

                    this.showhide(this.selectItemBox)
                }
            })

            // Edit filter item event
            this.selectItemEdit.addEventListener('click', ()=>{
                let option = this.selectItem.options[this.selectItem.selectedIndex]
                if(option.value != 'None'){
                    if(LS_DataOneClick.hasOwnProperty('items') && LS_DataOneClick.items.length){
                        this.selectItemSave.textContent = langs_select.edit_pattern
                        this.selectItemSave.title = langs_select.edit_pattern

                        const selectItem = LS_DataOneClick.items[this.selectItem.selectedIndex-1]

                        this.selectItemTextArea.value = selectItem.text
                        this.itIsChannels.checked = !selectItem.hasOwnProperty('channels') && !selectItem.channels ? false : selectItem.channels
                        this.selectItemInfo.innerHTML = this.get_infoText(this.selectItemTextArea.value)

                        this.showhide(this.selectItemBox)
                    }
                }
            })

            // Filter text [textarea]
            this.filtertext.addEventListener('input', ()=>{
                let filterChannelsList = this.filtertext.value.match(/"(\.|[^"'])*"/g) || []
                if(filterChannelsList.length){
                    this.filtertext.style.background = "limegreen"
                    this.filtertext.dataset.channels = true
                } else {
                    this.filtertext.style.background = 'none'
                    delete this.filtertext.dataset.channels
                }
            })

            // Textarea input popup
            this.selectItemTextArea.addEventListener('input', ()=>{
                this.selectItemInfo.innerHTML = this.get_infoText(this.selectItemTextArea.value)
            })


            // Save button filter
            this.selectItemSave.addEventListener('click', ()=>{
                let ta_text = this.selectItemTextArea.value,
                    itIsChannels = this.itIsChannels.checked

                if(!ta_text && !/^\s*$/i.test(ta_text) && ta_text.length<3){
                    alert(langs_select.modal_error_empty)
                    return
                }

                if(itIsChannels){
                    const findChannels = ta_text.match(/"(\.|[^"'])*"/g)

                    if(!findChannels){
                        alert(langs_select.modal_filter_channels_cheched_info)
                        itIsChannels = false
                    }
                }

                ta_text = ta_text.replace(/\s{1,}/ig,' ').split(' ').filter((t)=>t.length>=3).join(' ')

                if(LS_DataOneClick && LS_DataOneClick.hasOwnProperty('items')){

                    if(this.selectItemSave.textContent == langs_select.save_pattern){
                        let item = {text: ta_text, active: false, channels: itIsChannels}
                        LS_DataOneClick.items.push(item)

                    } else {
                        let item = LS_DataOneClick.items[this.selectItem.selectedIndex-1]

                        item.text = ta_text
                        item.channels = !item.hasOwnProperty('channels')? false : itIsChannels
                    }

                    LS_save()
                    this.updateSelectItem()
                    ta_text = this.selectItemTextArea.value=''
                    this.showhide(this.selectItemBox)
                }
            })

            // Click box filter
            this.selectItemBoxClose.addEventListener('click', this.showhide.bind(this, this.selectItemBox))

            this.selectItemRem.addEventListener('click', ()=>{
                let option = this.selectItem.options[this.selectItem.selectedIndex]
                if(option.value != 'None' && confirm(langs_select.modal_del_filter)){
                    if(LS_DataOneClick.hasOwnProperty('items') && LS_DataOneClick.items.length){

                        if(option.textContent === this.filtertext.value){
                            this.filtertext.value = ''
                            this.filtertext.style.background = ''
                            delete this.filtertext.dataset.channels
                        }

                        LS_DataOneClick.items.splice(this.selectItem.selectedIndex-1)
                        this.selectItem.removeChild(option)

                        LS_save()
                    }
                }
            })

            this.how_many.addEventListener('input', ()=> {
                this.cls_button.textContent = `${langs.clear_history} [${this.how_many.value}]`
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
            if(!element.style.display || element.style.display == 'block'){
                element.style.display = 'none'
                this.changeAttribute(this.selectItemRem, 'disabled', 'true', true)
                this.changeAttribute(this.selectItemEdit, 'disabled', 'true', true)

            } else {
                element.style.display = 'block'
                this.changeAttribute(this.selectItemRem, 'disabled', 'true', false)
                this.changeAttribute(this.selectItemEdit, 'disabled', 'true', true)
            }
        }

        clear_viewlist(){
            let list_checked = this.pop_list_history_body.querySelectorAll('#ul_list_view > li input')
            list_checked = Array.from(list_checked)
                .map((elem, idx)=>({index:idx,item:elem}))
                .filter((elem)=>elem.item.checked).map((elem)=>elem.index)

            list_checked = this.func_getlist.filter((elem, idx)=>list_checked.includes(idx))
            this.clear(list_checked)
            this.showhide(this.pop_list_history)
        }

        list_view(){
            this.func_getlist = this.getlist()

            this.pop_list_history_body.innerHTML = ''

            if(this.how_many_c.checked) this.func_getlist = this.func_getlist.splice(0, +this.how_many.value)

            if(this.func_getlist.length){
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
                this.showhide(this.pop_list_history)
            } else {
                alert(langs_select.modal_not_found_filter_empty)
            }
        }

        getlist(){
            let result = [],
                collections = [],
                text = this.filtertext.value,
                itIsChannels = this.filtertext?.dataset?.channels ? JSON.parse(this.filtertext.dataset.channels) : false,
                title_wrapper = document.querySelectorAll(buttonsNotDismiss + ' #title-wrapper')

            title_wrapper.forEach((t)=>{
                let vid_text = itIsChannels ? t.nextElementSibling?.querySelector(channelNameSelector)?.textContent: t.children[0].innerText,
                    vid_butdel = t.children[1].querySelector('button')

                collections.push({text:vid_text,but_del:vid_butdel})
            })

            if(text !== '' && !/^\s*$/g.test(text)){
                const text_ = itIsChannels ? text.match(/"(\.|[^"'])*"/g).map((t)=>t.replaceAll('"','')) : text.split(' ')

                if (itIsChannels && text_.length == 0){
                    console.log(text_)
                    alert(langs_select.modal_not_get_list)
                    return []
                }

                collections.forEach((collection_data)=>{
                    const textValue = collection_data.text.toLowerCase()
                    for(let t of text_){
                        if(textValue.includes(t.toLowerCase())){
                            result.push({text: collection_data.text, but_del: collection_data.but_del})
                        }
                    }
                })
            } else {
                result = collections
                alert(langs_select.modal_info_message[0]+' '+result.length+`${this.how_many_c.checked ? langs_select.modal_info_message[1] + this.how_many.value + langs_select.modal_info_message[2] : ''}`)
            }

            return result
        }

        async clear(list=null){

            let func_getlist = list ? list : this.getlist()

            if(!func_getlist.length){
                alert(langs_select.modal_not_found_filter_empty)
                return
            }

            if(!list && this.how_many_c.checked) func_getlist = func_getlist.splice(0, +this.how_many.value)

            if(confirm(`${langs_select.modal_confirm}${func_getlist.length}?${func_getlist.map((x)=>`● ${x.text}`).slice(0,35).join('\n')}'\n...`)){
                for(let butdel of func_getlist){
                    await butdel.but_del.click()
                }
            }
        }
    }

    function funcWaitElement(welem, func=()=>{console.log(arguments)}, many=false, time=500){
        setTimeout(()=>{
            const list = many ? document.querySelectorAll(welem) : document.querySelector(welem)
            if(list){
                log(`%cЭлемент ${welem} загрузился...`, "color: limegreen;font-weight: bold;")
                func.call('', list)
                return
            } else {
                log(`%cЭлемент ${welem} еще не загрузился, иду на повтор...`, "color: blue;font-weight: bold;")
                funcWaitElement(welem, func, many, time)
            }
        }, time)
    }

    function callbackOBS(mutations, observe){
        for(let m of mutations) {
            if(m.type === 'attributes' && m.attributeName ==='hidden'){
                log('Аттрибут ' + m.attributeName + ' был изменен.');
                if(m.target.hasAttribute('hidden')){
                    funcWaitElement(buttonsDeletes, (element)=>{
                        new HisoryClear()
                    }, true)
                    break
                }
            }
        }
    }

    function start(){
        LS_load()

        const funcWaitHist = elemnt =>{
            const mObs = new MutationObserver(callbackOBS)
            mObs.observe(elemnt, {
                attributes: true,
                childList: false,
                subtree: false
            })
        }
        funcWaitElement('ytd-browse', funcWaitHist)

        if(location.href.includes('feed/history')){
            funcWaitElement(buttonsDeletes, (element)=>{
                new HisoryClear()
            },true)
        }
    }


    start()

})();
