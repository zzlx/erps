/**
 * print
 * 
 * 新打开窗口中打印特定文档内容
 *
 * API使用方法：
 * window.open(URL, name, specs, replace)
 *
 */

export function Printer(e) {
  const url = '';
  const windowName = 'newwindow'
  const windowFeatures = "location=0,locationbar=0,menubar=0,resizable=0,scrollbars=0,status=0,titlebar=0,toolbar=0";
  const newWindow = window.open(url, windowName, windowFeatures);
  newWindow.document.write('<html>');
  newWindow.document.write('<head>');
  newWindow.document.write(`<title>print window</title>`);
  newWindow.document.write(`<link rel="stylesheet" type="text/css" href="/static/css/print.css" />`);
  newWindow.document.write(`
    <style type="text/css">
      @page { 
        size: A5 landscape; 
        margin: 2.54cm;
      }
    </style>
  `);
  newWindow.document.write('</head>');
  newWindow.document.write('<body onafterprint="self.close()">');
  newWindow.document.write(`
    <p>print page</p>
    <hr/>
    <button onclick="self.print()">打印</button>
  `);
  newWindow.document.write('</body></html>');
}
