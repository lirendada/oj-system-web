import request from '@/utils/request'
import type { 
  ContestVO, 
  ContestQueryRequest, 
  ContestProblemVO, 
  ContestRankVO, 
  PageResult 
} from '@/types/global'

enum Api {
  List = '/contest/list',
  Register = '/contest/register',
  Detail = '/contest',
  Problems = '/problems',
  Rank = '/rank'
}

export const getContestList = (data: ContestQueryRequest) => {
  return request.post<any, PageResult<ContestVO>>(Api.List, data)
}

export const registerContest = (contestId: string) => {
  return request.post<any, boolean>(`${Api.Register}/${contestId}`)
}

export const getContestDetail = (contestId: string) => {
  return request.get<any, ContestVO>(`${Api.Detail}/${contestId}`)
}

export const getContestProblemList = (contestId: string) => {
  return request.get<any, ContestProblemVO[]>(`${Api.Detail}/${contestId}${Api.Problems}`)
}

export const getContestRank = (contestId: string) => {
  return request.get<any, ContestRankVO[]>(`${Api.Detail}${Api.Rank}/${contestId}`)
}