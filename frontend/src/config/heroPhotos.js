// 英雄ID → 照片文件夹名 + 照片文件列表的映射
// 照片存放在 public/photos/{folder}/ 下

const HERO_PHOTO_MAP = {
  1:  { folder: 'zhaoyiman', name: '赵一曼', files: ['zhaoyiman1.jpg','zhaoyiman2.jpg','zhaoyiman3.jpg','zhaoyiman4.jpg','zhaoyiman5.jpg','zhaoyiman6.jpg'] },
  2:  { folder: 'yangjingyu', name: '杨靖宇', files: ['yangjingyu1.jpg','yangjingyu2.png','yangjingyu3.jpg','yangjingyu4.jpg','yangjingyu5.jpg'] },
  3:  { folder: 'liuhulan', name: '刘胡兰', files: ['liuhulan (1).jpg','liuhulan (2).jpg','liuhulan (3).jpg','liuhulan (4).jpg','liuhulan (5).jpg','liuhulan (6).jpg'] },
  4:  { folder: 'huangjiguang', name: '黄继光', files: ['huangjiguang (1).jpg','huangjiguang (2).jpg','huangjiguang (3).jpg','huangjiguang (4).jpg','huangjiguang (5).jpg','huangjiguang (6).jpg'] },
  5:  { folder: 'qiushaoyun', name: '邱少云', files: ['qiushaoyun (1).jpg','qiushaoyun (2).jpg','qiushaoyun (3).jpg','qiushaoyun (4).jpg','qiushaoyun (5).jpg'] },
  6:  { folder: 'dongcunrui', name: '董存瑞', files: ['dongcunrui (1).jpg','dongcunrui (2).jpg','dongcunrui (3).jpg','dongcunrui (4).jpg','dongcunrui (5).jpg','dongcunrui (6).jpg','dongcunrui (7).jpg'] },
  7:  { folder: 'zuoquan', name: '左权', files: ['zuoquan (1).jpg','zuoquan (2).jpg','zuoquan (3).jpg','zuoquan (4).jpg','zuoquan (5).jpg','zuoquan (6).jpg'] },
  8:  { folder: 'jiangzhuyun', name: '江竹筠', files: ['jiangzhuyun (1).jpg','jiangzhuyun (2).jpg','jiangzhuyun (3).jpg','jiangzhuyun (4).jpg','jiangzhuyun (5).jpg','jiangzhuyun (6).jpg'] },
  9:  { folder: 'zhangsidei', name: '张思德', files: ['zhangsidei (1).jpg','zhangsidei (2).jpg','zhangsidei (3).jpg','zhangsidei (4).jpg','zhangsidei (5).jpg'] },
  10: { folder: 'langyashanwuzhuangshi', name: '狼牙山五壮士', files: ['langyashanwuzhuangshi (1).jpg','langyashanwuzhuangshi (2).jpg','langyashanwuzhuangshi (3).jpg','langyashanwuzhuangshi (4).jpg','langyashanwuzhuangshi (5).jpg','langyashanwuzhuangshi (6).jpg'] },
  11: { folder: 'fangzhimin', name: '方志敏', files: ['fangzhimin (1).jpg','fangzhimin (2).jpg','fangzhimin (3).jpg','fangzhimin (4).jpg','fangzhimin (5).jpg','fangzhimin (6).jpg'] },
  12: { folder: 'lidazhao', name: '李大钊', files: ['lidazhao (1).jpg','lidazhao (2).jpg','lidazhao (3).jpg','lidazhao (4).jpg','lidazhao (5).jpg'] },
  13: { folder: 'caihesen', name: '蔡和森', files: ['caihesen (1).jpg','caihesen (2).jpg','caihesen (3).jpg','caihesen (4).jpg','caihesen (5).jpg','caihesen (6).jpg','caihesen (7).jpg','caihesen (8).jpg'] },
  14: { folder: 'yeting', name: '叶挺', files: ['yeting (1).jpg','yeting (2).jpg','yeting (3).jpg','yeting (4).jpg','yeting (5).jpg','yeting (6).jpg','yeting (7).jpg','yeting (8).jpg','yeting (9).jpg'] },
  15: { folder: 'zhangzizhong', name: '张自忠', files: ['zhangzizhong (1).jpg','zhangzizhong (2).jpg','zhangzizhong (3).jpg','zhangzizhong (4).jpg','zhangzizhong (5).jpg','zhangzizhong (6).jpg','zhangzizhong (7).jpg','zhangzizhong (8).jpg'] },
  16: { folder: 'xiangjingyu', name: '向警予', files: ['xiejinyuan (1).jpg','xiejinyuan (2).jpg','xiejinyuan (3).jpg','xiejinyuan (4).jpg','xiejinyuan (5).jpg','xiejinyuan (6).jpg','xiejinyuan (7).jpg','xiejinyuan (8).jpg','xiejinyuan (9).jpg'] },
  17: { folder: 'xiejinyuan', name: '谢晋元', files: ['xiejinyuan (1).jpg','xiejinyuan (2).jpg','xiejinyuan (3).jpg','xiejinyuan (4).jpg','xiejinyuan (5).jpg'] },
  18: { folder: 'xiaminghan', name: '夏明翰', files: ['xiaminghan (1).jpg','xiaminghan (2).jpg','xiaminghan (3).jpg','xiaminghan (4).jpg'] },
  19: { folder: 'guanxiangying', name: '关向应', files: ['guanxiangying (1).jpg','guanxiangying (2).jpg','guanxiangying (3).jpg','guanxiangying (4).jpg','guanxiangying (5).jpg','guanxiangying (6).jpg','guanxiangying (7).jpg','guanxiangying (8).jpg','guanxiangying (9).jpg','guanxiangying (10).jpg'] },
  20: { folder: 'xunhuaizhou', name: '寻淮洲', files: ['xunhuaizhou (1).jpg','xunhuaizhou (2).jpg','xunhuaizhou (3).jpg','xunhuaizhou (4).jpg'] },
  21: { folder: 'chenyannian', name: '陈延年', files: ['chenyannian (1).jpg','chenyannian (1).png','chenyannian (2).jpg','chenyannian (3).jpg','chenyannian (4).jpg'] },
  22: { folder: 'chenqiaonian', name: '陈乔年', files: ['chenqiaonian (1).jpg','chenqiaonian (1).png','chenqiaonian (2).jpg','chenqiaonian (3).jpg','chenqiaonian (4).jpg'] },
  23: { folder: 'quqiubai', name: '瞿秋白', files: ['quqiubai (1).jpg','quqiubai (2).jpg','quqiubai (3).jpg','quqiubai (4).jpg','quqiubai (5).jpg','quqiubai (6).jpg','quqiubai (7).jpg'] },
  24: { folder: 'zhaoshiyan', name: '赵世炎', files: ['zhaoshiyan (1).jpg','zhaoshiyan (2).jpg','zhaoshiyan (3).jpg','zhaoshiyan (4).jpg','zhaoshiyan (5).jpg','zhaoshiyan (6).jpg','zhaoshiyan (7).jpg','zhaoshiyan (8).jpg'] },
  25: { folder: 'daianlan', name: '戴安兰', files: ['daianlan (1).jpg','daianlan (2).jpg','daianlan (3).jpg','daianlan (4).jpg','daianlan (5).jpg','daianlan (6).jpg'] },
  26: { folder: 'zhaoshangzhi', name: '赵尚志', files: ['zhaoshangzhi (1).jpg','zhaoshangzhi (2).jpg','zhaoshangzhi (3).jpg','zhaoshangzhi (4).jpg','zhaoshangzhi (5).jpg','zhaoshangzhi (6).jpg','zhaoshangzhi (7).jpg','zhaoshangzhi (8).jpg','zhaoshangzhi (9).jpg','zhaoshangzhi (10).jpg','zhaoshangzhi (11).jpg'] },
  27: { folder: 'liuzhidan', name: '刘志丹', files: ['liuzhidan (1).jpg','liuzhidan (2).jpg','liuzhidan (3).jpg','liuzhidan (4).jpg','liuzhidan (5).jpg','liuzhidan (6).jpg'] },
  28: { folder: 'yundaiying', name: '恽代英', files: ['yundaiying (1).jpg','yundaiying (2).jpg','yundaiying (3).jpg','yundaiying (4).jpg','yundaiying (5).jpg','yundaiying (6).jpg','yundaiying (7).jpg'] },
  29: { folder: 'pengpai', name: '彭湃', files: ['pengpai (1).jpg','pengpai (2).jpg','pengpai (3).jpg','pengpai (4).jpg','pengpai (5).jpg'] },
  30: { folder: 'weibaqun', name: '韦拔群', files: ['weibaqun (1).jpg','weibaqun (2).jpg','weibaqun (3).jpg','weibaqun (4).jpg','weibaqun (5).jpg','weibaqun (6).jpg','weibaqun (7).jpg','weibaqun (8).jpg','weibaqun (9).jpg','weibaqun (10).jpg'] },
  31: { folder: 'chenkangrong', name: '陈康容', files: ['chenkangrong (1).jpg','chenkangrong (2).jpg','chenkangrong (3).jpg','chenkangrong (4).jpg','chenkangrong (5).jpg','chenkangrong (6).jpg','chenkangrong (7).jpg'] },
  32: { folder: 'wuhuanxian', name: '吴焕先', files: ['wuhuanxian (1).jpg','wuhuanxian (2).jpg','wuhuanxian (3).jpg','wuhuanxian (4).jpg','wuhuanxian (5).jpg','wuhuanxian (6).jpg','wuhuanxian (7).jpg'] },
  33: { folder: 'luobinghui', name: '罗炳辉', files: ['luobinghui (1).jpg','luobinghui (2).jpg','luobinghui (3).jpg','luobinghui (4).jpg','luobinghui (5).jpg','luobinghui (6).jpg','luobinghui (7).jpg','luobinghui (8).jpg','luobinghui (9).jpg','luobinghui (10).jpg','luobinghui (11).jpg','luobinghui (12).jpg','luobinghui (13).jpg'] },
  34: { folder: 'zhangtailei', name: '张太雷', files: ['zhangtailei (1).jpg','zhangtailei (2).jpg','zhangtailei (3).jpg','zhangtailei (4).jpg','zhangtailei (5).jpg','zhangtailei (6).jpg'] },
  35: { folder: 'huanggonglue', name: '黄公略', files: ['huanggonglue (1).jpg','huanggonglue (2).jpg','huanggonglue (3).jpg','huanggonglue (4).jpg','huanggonglue (5).jpg','huanggonglue (6).jpg','huanggonglue (7).jpg','huanggonglue (8).jpg'] },
}

// 根据英雄ID获取照片URL数组
export function getHeroPhotos(heroId) {
  const hero = HERO_PHOTO_MAP[heroId]
  if (!hero) return []
  return hero.files.map((file, index) => ({
    url: `/photos/${hero.folder}/${encodeURIComponent(file)}`,
    desc: `${hero.name}历史照片 (${index + 1})`
  }))
}

// 获取所有英雄的照片（用于珍贵影像页面）
export function getAllHeroPhotos() {
  return Object.entries(HERO_PHOTO_MAP).map(([id, hero]) => ({
    id: Number(id),
    name: hero.name,
    folder: hero.folder,
    photos: hero.files.map((file, index) => ({
      url: `/photos/${hero.folder}/${encodeURIComponent(file)}`,
      desc: `${hero.name}历史照片 (${index + 1})`
    }))
  }))
}

export default HERO_PHOTO_MAP
