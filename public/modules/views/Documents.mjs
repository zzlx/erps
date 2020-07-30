/**
 * 文章UI
 * 
 */

// 引入UI组件
import {
  Spinner,
  Markdown,
} from '../components/Spinner.mjs';

import array from '../utils/arrayUtils.mjs';

export default class Documents extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      doc: null
    }
  }

  render() {
    const opts = {
      query: `
        query QueryDoc ($fileName: String){
          docs (fileName: $fileName)
        } 
      `,
      variables: {
        fileName: this.props.match.params.docFile || null,
      }
    } 

    const el = React.createElement;
    const ImageDiv = el('div', { className: 'bg-image'});

    if (null !== this.state.doc) {
      return el('div', { 
        className: "p-3 mx-auto",
        style: { width: '42rem', }
      }, this.state.doc);
    }

  }

  componentDidMount() {
    if (this.props.match.params.docFile) {
      document.title = this.props.match.params.docFile;
    } else {
      document.title = '帮助';
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    document.title = this.props.match.params.docFile;
  }
}
