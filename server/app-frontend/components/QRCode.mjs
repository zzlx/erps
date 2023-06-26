/**
 *
 * QRCode
 *
 * 二维码组件
 *
 */

import React from './React.mjs';

export default class QRCode extends React.PureComponent { 
    constructor(props) {
        super(props);
        this._ref = React.createRef();
    }

    componentDidMount() {
        const canvas = this._ref.current;

        import('qrcode').then(module => {
            const QRC = module.default;

            QRC.toCanvas(canvas, this.props.data, (error) => {
            if (error) console.error(error)
            });
        });
    }

    render() {
        const { data, className } = this.props;
        return React.createElement('canvas', {
          className: className,
          ref: this._ref,
        }, '客户端不支持canvas组件,请升级客户端.');
    }
}
