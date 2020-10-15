/**
 *
 *
 *
 * 根据数据字段自适应生成表单
 * 
 */

import React from './React.mjs';

export default class Form extends React.PureComponent {
  constructor(props) {
    super(props);
    this.Ref = React.createRef();
  }

  validation() { 
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
  }

  componentDidMount() {
    const form = this.Ref.current;

    // 为元素集合添加className 
    const addInputGroupText = elements => { 
      for (let i = 0; i < elements.length; i++) { 
        // 仅为span添加text样式
        if (elements[i].tagName === 'SPAN') elements[i].classList.add('input-group-text');
      }
    }

    form.querySelectorAll('input, select, textarea').forEach(v => {
      // 根据情况添加样式
      switch (v.type) {
        case 'file': 
          v.classList.add('form-control-file');
          break;
        case 'range':
          v.classList.add('form-control-range');
          break;
        case 'checkbox':
        case 'radio':
          v.classList.add('form-check-input');
          break;
        case 'submit':
        case 'reset':
        case 'button':
          break;
        default:
          v.classList.add('form-control');
      }

      // 对父元素添加样式
      if (v.parentNode.tagName === 'DIV') {
        if (/checkbox|radio/.test(v.type)) v.parentNode.classList.add('form-check');
        else v.parentNode.classList.add('form-group');
      }
      
      // 如果上一个兄弟元素存在且为div,则应用input-group-append
      if (v.previousSibling && v.previousSibling.tagName === 'DIV') {
        v.parentNode.classList.replace('form-group', 'input-group');
        v.previousSibling.classList.add('input-group-prepend');
        addInputGroupText(v.previousSibling.children);
      }

      // 如果下一个兄弟元素存在且为small,则应用form-text
      if (v.parentNode.lastChild && v.parentNode.lastChild.tagName === 'SMALL') {
        v.parentNode.lastChild.classList.add('form-text','text-muted');
      }

      // 如果下一个兄弟元素存在且为div,则应用input-group-append
      if (v.nextSibling && v.nextSibling.tagName === 'DIV') {
        v.parentNode.classList.add('input-group');
        v.nextSibling.classList.add('input-group-append');
        addInputGroupText(v.nextSibling.children);
      }
    });

    // form的直接div元素，如果没有form-group\input-group\from-check,则添加form-row
    form.querySelectorAll('form > div').forEach(v => {
      // form的直接子元素为div的添加form-group
      if(v.classList.contains('form-group') 
        || v.classList.contains('input-group')
        || v.classList.contains('form-check')
      ) { return; }
      v.classList.add('form-row');
    });


    this.validation();
  }

  render() {
    const {inline, className, validate, ...rests} = this.props;

    const cn = [];
    if (inline) cn.push('form-inline');
    if (validate) cn.push('needs-validation');
    if (className) cn.push(className);

    return React.createElement('form', {
      ref: this.Ref,
      onSubmit: e => e.preventDefault(),
      className: cn.join(' ') || null,
      ...rests,
    });
  }
}
