/**
 * 身份证ID解析器
 *
 * 根据身份证号字段分析计算, 输出信息如下:
 * 年龄
 * 性别
 * 出生年月日
 * 省份编码
 * 城市编码
 * 地区编码的个人信息对象
 *
 * @param {string} value
 * @return {obj} 返回包含个人信息的对象
 */

export default function IDParser (value) {
	const v = String(value); //value
	const r = {}; // retval

	// 个人基本信息
  r.sex = Number(v.charAt(16))%2 === 0 ? '女' : '男';
	r.birth = v.substr(6,8).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3");
	r.age = ((Date.now() - Date.parse(r.birth))/31536000000).toFixed();

	// 仅能说明籍贯信息, 当前所在城市还需要另行获取
	r.stateCode = v.substr(0,3) + '000';
	r.cityCode = v.substr(0,4) + '00';
	r.regionCode = v.substr(0, 6);

	return r;
}
