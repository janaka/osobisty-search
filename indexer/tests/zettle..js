"use strict";
// import { GreyMatterFileToTsZettleDoc } from '../src/zettle'
// import matter from 'gray-matter'
// jest.mock('../src/zettle-matter');
// jest.mock('gray-matter');
// //const mockedMatter = matter as jest.Mock<typeof matter, any>
// test('mddoc with all field', () => {
//   const matterResp: matter.GrayMatterFile<string> = matter.mockResolvedValue(
//     {
//       data: { 
//         title: 'top level strategy', 
//         type: 'fleeting',
//         tags: '#strategy-notes #product-strategy #technology-strategy',
//         date: '2021-07-20',
//         lastmodifed: '2021-07-20T12:20:31'
//       },
//       content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
//                 \
//                 ## sociis natoque \
//                 \
//                 Elit eget gravida cum sociis natoque penatibus et magnis. \
//                 \
//                 Id neque aliquam vestibulum morbi blandit cursus.'
//     }
//   );
//   const tsDoc = {
//     type: 'zettle-fleeting',
//     title: 'top level strategy',
//     tags: '#strategy-notes #product-strategy #technology-strategy',
//     date: '2021-07-20',
//     content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
//     \
//     ## sociis natoque \
//     \
//     Elit eget gravida cum sociis natoque penatibus et magnis. \
//     \
//     Id neque aliquam vestibulum morbi blandit cursus.',
//     rank: 1
//   }
//   //expect(GreyMatterFileToTsZettleDoc(mdfile, "test-xyz.md")).toBe;
//   return GreyMatterFileToTsZettleDoc(matterResp, "test-xyz.md").then((data:any) => expect(data).toEqual(tsDoc));
// });
