// src/api/problem.ts
import request from '@/utils/request'
// 假设您已将文件重命名为 global.ts 并放在 src/types 下
import type { ProblemAPI, RankItemVO, SubmitRecordVO } from '@/types/global'

enum Api {
  List = '/problem/list/page',
  Detail = '/problem/detail',
  Submit = '/problem/submit',
  // ✅ 新增排行榜接口路径
  RankDaily = '/problem/rank/daily',
  RankWeekly = '/problem/rank/weekly',
  RankMonthly = '/problem/rank/monthly',
  RankTotal = '/problem/rank/total'
}

/**
 * 分页获取题目列表
 */
export const getProblemList = (data: ProblemAPI.ListRequest) => {
  // 泛型第二个参数是返回数据的类型 (PageResult<ProblemVO>)
  return request.post<any, ProblemAPI.ListResponse>(Api.List, data)
}

/**
 * 获取题目详情
 */
export const getProblemDetail = (id: string) => {
  return request.get<any, ProblemAPI.DetailResponse>(`${Api.Detail}/${id}`)
}

/**
 * 提交题目
 */
export const submitProblem = (data: ProblemAPI.SubmitRequest) => {
  return request.post<any, ProblemAPI.SubmitResponse>(Api.Submit, data)
}

// 获取提交记录详情 (用于轮询判题结果)
export const getSubmitResult = (submitId: string) => {
  return request.get<any, SubmitRecordVO>(`/problem/submit/result/${submitId}`)
}

/**
 * 获取排行榜数据
 * @param type 'daily' | 'weekly' | 'monthly' | 'total'
 */
export const getRankList = (type: 'daily' | 'weekly' | 'monthly' | 'total' = 'total') => {
  let url = Api.RankTotal
  switch (type) {
    case 'daily': url = Api.RankDaily; break;
    case 'weekly': url = Api.RankWeekly; break;
    case 'monthly': url = Api.RankMonthly; break;
    case 'total': url = Api.RankTotal; break;
  }
  return request.get<any, RankItemVO[]>(url)
}