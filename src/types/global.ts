// ========================================
// 通用类型定义
// ========================================

/**
 * 通用响应结构 Result<T>
 */
export interface Result<T = any> {
  code: number;      // 状态码 (成功为 1000)
  message: string;
  data: T;
}

/**
 * 分页请求参数基类 (对应后端 PageRequest.java)
 * 注意：后端用的是 pageSize
 */
export interface PageRequest {
  current: number;   // 当前页码
  pageSize: number;  // 每页条数 (Backend: pageSize)
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

/**
 * 分页响应结果 (对应 MyBatis Plus 的 Page<T> 序列化 JSON)
 * 注意：MyBatis Plus 默认返回的是 size
 */
export interface PageResult<T> {
  records: T[];      // 数据列表
  total: number;     // 总条数
  size: number;      // 每页条数 (Backend: size)
  current: number;   // 当前页码
  pages: number;     // 总页数
}

// ========================================
// 枚举类型定义
// ========================================

/**
 * 题目难度枚举
 */
export enum DifficultyEnum {
  EASY = 1,          // 简单
  MEDIUM = 2,        // 中等
  HARD = 3           // 困难
}

/**
 * 题目难度文本映射
 */
export const DifficultyText: Record<DifficultyEnum, string> = {
  [DifficultyEnum.EASY]: '简单',
  [DifficultyEnum.MEDIUM]: '中等',
  [DifficultyEnum.HARD]: '困难'
};

/**
 * 判题状态枚举 (对应 ProblemStatusEnum)
 */
export enum SubmitStatusEnum {
  PENDING = 0,       // 等待判题
  JUDGING = 10,      // 判题中
  SUCCEED = 30,      // 判题完成
  FAILED = 40        // 判题失败
}

/**
 * 判题结果枚举 (对应 JudgeResultEnum)
 */
export enum JudgeResultEnum {
  AC = 1,            // Accepted - 通过
  WA = 2,            // Wrong Answer - 答案错误
  TLE = 3,           // Time Limit Exceeded - 超时
  MLE = 4,           // Memory Limit Exceeded - 内存超限
  RE = 5,            // Runtime Error - 运行时错误
  CE = 6,            // Compilation Error - 编译错误
  SE = 7             // System Error - 系统错误
}

/**
 * 判题结果文本映射
 */
export const JudgeResultText: Record<JudgeResultEnum, string> = {
  [JudgeResultEnum.AC]: '通过 (Accepted)',
  [JudgeResultEnum.WA]: '答案错误 (Wrong Answer)',
  [JudgeResultEnum.TLE]: '运行超时 (Time Limit Exceeded)',
  [JudgeResultEnum.MLE]: '内存超限 (Memory Limit Exceeded)',
  [JudgeResultEnum.RE]: '运行错误 (Runtime Error)',
  [JudgeResultEnum.CE]: '编译错误 (Compile Error)',
  [JudgeResultEnum.SE]: '系统错误 (System Error)'
};

/**
 * 判题结果样式类名映射
 */
export const JudgeResultClass: Record<JudgeResultEnum, string> = {
  [JudgeResultEnum.AC]: 'result-ac',
  [JudgeResultEnum.WA]: 'result-wa',
  [JudgeResultEnum.TLE]: 'result-tle',
  [JudgeResultEnum.MLE]: 'result-mle',
  [JudgeResultEnum.RE]: 'result-re',
  [JudgeResultEnum.CE]: 'result-ce',
  [JudgeResultEnum.SE]: 'result-se'
};

/**
 * 编程语言枚举
 */
export enum LanguageEnum {
  JAVA = 'Java',
  CPP = 'C++',
  PYTHON = 'Python',
  C = 'C',
  GO = 'Go',
  JAVASCRIPT = 'JavaScript'
}

/**
 * 比赛状态枚举
 */
export enum ContestStatusEnum {
  NOT_STARTED = 0,   // 未开始
  IN_PROGRESS = 1,   // 进行中
  ENDED = 2          // 已结束
}

/**
 * 比赛状态文本映射
 */
export const ContestStatusText: Record<ContestStatusEnum, string> = {
  [ContestStatusEnum.NOT_STARTED]: '未开始',
  [ContestStatusEnum.IN_PROGRESS]: '进行中',
  [ContestStatusEnum.ENDED]: '已结束'
};

/**
 * 用户状态枚举
 */
export enum UserStatusEnum {
  DISABLED = 0,      // 禁用
  NORMAL = 1         // 正常
};

// ========================================
// DTO 类型定义 (Data Transfer Object - 请求数据)
// ========================================

/**
 * 用户登录 DTO (对应 UserLoginDTO.java)
 */
export interface UserLoginDTO {
  userAccount: string;    // 用户账号（必填）
  password: string;       // 用户密码（必填）
}

/**
 * 用户注册 DTO
 */
export interface UserRegisterDTO {
  userAccount: string;    // 用户账号（必填）
  password: string;       // 用户密码（必填）
  checkPassword: string;  // 校验密码（必填）
  nickName?: string;      // 昵称
  email?: string;         // 邮箱
  phone?: string;         // 电话
  school?: string;        // 学校
}

/**
 * 用户更新 DTO
 */
export interface UserUpdateDTO {
  nickName?: string;      // 昵称
  avatar?: string;        // 头像
  email?: string;         // 邮箱
  phone?: string;         // 电话
  school?: string;        // 学校
}

/**
 * 题目查询请求 DTO (对应 ProblemQueryRequest.java)
 */
export interface ProblemQueryRequest extends PageRequest {
  problemId?: string;     // 题目ID（精确搜索）
  keyword?: string;       // 标题/内容关键词（模糊搜索）
  difficulty?: DifficultyEnum;  // 难度（精确搜索：1-简单 2-中等 3-困难）
  tags?: string[];        // 标签
}

/**
 * 题目添加/更新 DTO (对应 ProblemAddDTO.java)
 */
export interface ProblemAddDTO {
  problemId?: string;     // 题目ID（更新时必填）
  title: string;          // 题目标题（必填）
  difficulty: DifficultyEnum;  // 难度（必填）：1-简单 2-中等 3-困难
  description: string;    // 题目描述（必填）
  inputDescription?: string;    // 输入描述
  outputDescription?: string;   // 输出描述
  timeLimit: number;      // 时间限制ms（必填）
  memoryLimit: number;    // 内存限制MB（必填）
  stackLimit?: number;    // 栈限制MB（必填）
  sampleInput?: string;   // 样例输入
  sampleOutput?: string;  // 样例输出
  hint?: string;          // 提示
  source?: string;        // 来源
  tagIds?: string[];      // 关联的标签ID列表
  testCases?: TestCaseDTO[];  // 测试用例列表
}

/**
 * 题目提交 DTO (对应 ProblemSubmitDTO.java)
 */
export interface ProblemSubmitDTO {
  problemId: string;      // 题目ID（必填）
  language: LanguageEnum;  // 编程语言（必填）：Java/C++/Python
  code: string;           // 代码（必填）
  contestId?: string;     // 竞赛ID（可选，平时做题为0或null）
}

/**
 * 测试用例 DTO (对应 TestCaseDTO.java)
 */
export interface TestCaseDTO {
  input: string;          // 输入数据
  output: string;         // 期望输出
}

/**
 * 比赛添加/更新 DTO (对应 ContestAddDTO.java)
 */
export interface ContestAddDTO {
  contestId?: string;     // 比赛ID（修改时必填）
  title: string;          // 比赛标题（必填）
  description?: string;   // 比赛描述
  startTime: string;      // 开始时间（必填）ISO 8601格式
  endTime: string;        // 结束时间（必填）ISO 8601格式
}

/**
 * 比赛题目关联 DTO (对应 ContestProblemAddDTO.java)
 */
export interface ContestProblemAddDTO {
  contestId: string;      // 比赛ID（必填）
  problemId: string;      // 题目ID（必填）
  displayId: string;      // 展示序号（必填）：例如 A, B, C
}

// ========================================
// Entity 类型定义 (数据库实体)
// ========================================

/**
 * 基础实体接口
 */
export interface BaseEntity {
  createTime?: string;    // 创建时间
  updateTime?: string;    // 更新时间
  createBy?: string;      // 创建者（雪花算法ID）
  updateBy?: string;      // 更新者（雪花算法ID）
}

/**
 * 用户实体 (对应 UserEntity.java)
 */
export interface UserEntity extends BaseEntity {
  userId: string;         // 主键ID（雪花算法）
  userAccount: string;    // 用户账号
  password: string;       // 密码
  nickName: string;       // 昵称
  avatar: string;         // 头像
  email: string;          // 邮箱
  phone: string;          // 电话
  school: string;         // 学校
  status: UserStatusEnum; // 状态：0-禁用 1-正常
  submittedCount: number; // 提交数
  acceptedCount: number;  // 通过数
  rating: number;         // 评分
  deleted: number;        // 逻辑删除：0-未删除 1-已删除
}

/**
 * 题目实体 (对应 ProblemEntity.java)
 */
export interface ProblemEntity extends BaseEntity {
  problemId: string;           // 主键ID（雪花算法）
  title: string;               // 题目标题
  difficulty: DifficultyEnum;  // 难度：1-简单 2-中等 3-困难
  submitNum: number;           // 提交数
  acceptedNum: number;         // 通过数
  description: string;         // 题目描述
  inputDescription: string;    // 输入描述
  outputDescription: string;   // 输出描述
  timeLimit: number;           // 时间限制ms
  memoryLimit: number;         // 空间限制MB
  stackLimit: number;          // 栈空间限制MB
  sampleInput: string;         // 样例输入
  sampleOutput: string;        // 样例输出
  hint: string;                // 提示
  source: string;              // 来源
  status: number;              // 状态：0-隐藏 1-正常
  deleted: number;             // 逻辑删除
}

/**
 * 题目提交记录实体 (对应 ProblemSubmitRecordEntity.java)
 */
export interface ProblemSubmitRecordEntity extends BaseEntity {
  submitId: string;            // 主键ID（雪花算法）
  problemId: string;           // 题目ID
  contestId: string;           // 竞赛ID
  userId: string;              // 用户ID
  code: string;                // 用户提交的代码
  language: LanguageEnum;      // 用户选择的编程语言
  status: SubmitStatusEnum;    // 判题状态（对应 ProblemStatusEnum）
  judgeResult: JudgeResultEnum; // 判题结果（对应 JudgeResultEnum）
  timeCost: number;            // 最大耗时ms
  memoryCost: number;          // 最大内存KB
  errorMessage: string;        // 错误信息
  caseResult: string;          // 每个测试点的详细结果（JSON格式）
  score: number;               // 判题得分
}

/**
 * 题目标签实体 (对应 ProblemTagEntity.java)
 */
export interface ProblemTagEntity {
  tagId: string;               // 主键ID（雪花算法）
  tagName: string;             // 标签名称
  tagColor: string;            // 标签颜色
}

/**
 * 题目标签关联实体 (对应 ProblemTagRelationEntity.java)
 */
export interface ProblemTagRelationEntity {
  id: string;                  // 主键ID（自增）
  problemId: string;           // 题目ID
  tagId: string;               // 标签ID
}

/**
 * 测试用例实体 (对应 TestCaseEntity.java)
 */
export interface TestCaseEntity {
  caseId: string;              // 主键ID（雪花算法）
  problemId: string;           // 题目ID
  input: string;               // 输入数据
  output: string;              // 期望输出
}

/**
 * 比赛实体 (对应 ContestEntity.java)
 */
export interface ContestEntity extends BaseEntity {
  contestId: string;           // 主键ID（雪花算法）
  title: string;               // 竞赛标题
  description: string;         // 竞赛描述
  status: ContestStatusEnum;   // 状态：0-未开始 1-进行中 2-已结束
  startTime: string;           // 开始时间
  endTime: string;             // 结束时间
  deleted: number;             // 逻辑删除
}

/**
 * 比赛题目关联实体 (对应 ContestProblemEntity.java)
 */
export interface ContestProblemEntity {
  id: string;                  // 主键ID（自增）
  contestId: string;           // 竞赛ID
  problemId: string;           // 题目ID
  displayId: string;           // 竞赛中的展示ID，如 A, B, C...
}

/**
 * 比赛报名实体 (对应 ContestRegistrationEntity.java)
 */
export interface ContestRegistrationEntity {
  id: string;                  // 主键ID（自增）
  contestId: string;           // 竞赛ID
  userId: string;              // 用户ID
  createTime: string;          // 创建时间（自动填充）
}

// ========================================
// VO 类型定义 (View Object - 响应数据)
// ========================================

/**
 * 用户登录响应 VO (对应 UserLoginVO.java)
 */
export interface UserLoginVO {
  user: UserEntity;
  token: string;
}

/**
 * 题目标签 VO (对应 ProblemTagVO.java)
 */
export interface ProblemTagVO {
  tagId: string;               // 标签ID（雪花算法）
  tagName: string;             // 标签名称
  tagColor: string;            // 标签颜色
}

/**
 * 题目基础信息 VO (对应 ProblemBasicInfoDTO.java)
 */
export interface ProblemBasicInfoDTO {
  problemId: string;           // 题目ID（雪花算法）
  title: string;               // 题目标题
  difficulty: DifficultyEnum;  // 难度
  timeLimit: number;           // 时间限制
  memoryLimit: number;         // 内存限制
}

/**
 * 题目列表 VO (对应 ProblemVO.java)
 */
export interface ProblemVO {
  problemId: string;           // 题目ID（使用 ToStringSerializer 防止前端精度丢失）
  title: string;               // 题目标题
  difficulty: DifficultyEnum;  // 题目难度：1-简单 2-中等 3-困难
  tags: ProblemTagVO[];        // 标签列表
  submitNum: number;           // 提交数
  acceptedNum: number;         // 通过数
  status: number;              // 状态：0-隐藏 1-正常
  createTime: string;          // 题目创建时间
}

/**
 * 题目详情 VO (对应 ProblemDetailVO.java)
 * 继承自 ProblemVO，额外包含详细信息
 */
export interface ProblemDetailVO extends ProblemVO {
  description: string;         // 题目描述(Markdown)
  inputDescription: string;    // 输入描述
  outputDescription: string;   // 输出描述
  timeLimit: number;           // 时间限制ms
  memoryLimit: number;         // 空间限制MB
  stackLimit: number;          // 栈空间限制MB
  sampleInput: string;         // 样例输入
  sampleOutput: string;        // 样例输出
  hint: string;                // 提示
  source: string;              // 来源
}

/**
 * 提交记录 VO (对应 SubmitRecordVO.java)
 */
export interface SubmitRecordVO extends BaseEntity {
  submitId: string;            // 提交记录ID（雪花算法）
  problemId: string;           // 题目ID
  contestId: string;           // 比赛ID
  userId: string;              // 用户ID
  code: string;                // 提交代码（非本人查看时需脱敏）
  language: LanguageEnum;      // 用户选择的编程语言
  status: SubmitStatusEnum;    // 判题状态
  judgeResult: JudgeResultEnum; // 判题结果
  timeCost: number;            // 最大耗时ms
  memoryCost: number;          // 最大内存KB
  errorMessage: string;        // 错误信息（非本人查看时需脱敏）
  passCaseCount?: number;   // ✅ 新增
  totalCaseCount?: number;  // ✅ 新增
}

/**
 * 比赛列表 VO (对应 ContestVO.java)
 */
export interface ContestVO extends BaseEntity {
  contestId: string;           // 竞赛ID
  title: string;               // 竞赛标题
  description: string;         // 竞赛描述
  status: ContestStatusEnum;   // 状态：0-未开始 1-进行中 2-已结束（VO层动态计算）
  statusDesc: string;          // 状态描述文本
  startTime: string;           // 开始时间
  endTime: string;             // 结束时间
  duration: string;            // 持续时间（例如：2小时30分）
  registered?: boolean; 
}

/**
 * 用户基础信息 VO (对应 UserBasicInfoDTO.java)
 */
export interface UserBasicInfoDTO {
  id: string;                  // 用户ID（雪花算法）
  nickname: string;            // 用户昵称
  avatar: string;              // 用户头像
}

/**
 * 提交记录更新 DTO (对应 ProblemSubmitUpdateDTO.java)
 * 用于判题服务回写判题结果
 */
export interface ProblemSubmitUpdateDTO {
  submitId: string;            // 提交ID（雪花算法）
  status: SubmitStatusEnum;    // 判题状态（对应 SubmitStatusEnum，通常回写时都是 30-SUCCEED）
  judgeResult: JudgeResultEnum; // 判题结果（对应 JudgeResultEnum：AC/WA/TLE...）
  timeCost: number;            // 耗时ms
  memoryCost: number;          // 内存消耗KB
  errorMessage: string;        // 错误信息（如果是 CE/RE，存详细报错）
  passCaseCount: number;       // 通过用例数
  totalCaseCount: number;      // 总用例数
}

// ========================================
// API 层类型定义
// ========================================

/**
 * 用户相关 API 类型
 */
export namespace UserAPI {
  type LoginResponse = UserLoginVO;
  type RegisterResponse = UserEntity;
  type GetInfoResponse = UserEntity;
}

/**
 * 题目相关 API 类型
 */
export namespace ProblemAPI {
  type ListRequest = ProblemQueryRequest;
  type ListResponse = PageResult<ProblemVO>;
  type DetailResponse = ProblemDetailVO;
  type SubmitRequest = ProblemSubmitDTO;
  type SubmitResponse = string;
}

/**
 * 提交记录相关 API 类型
 */
export namespace SubmissionAPI {
  type ListRequest = PageRequest & {
    problemId?: string;
    userId?: string;
  };
  type ListResponse = PageResult<SubmitRecordVO>;
  type DetailResponse = SubmitRecordVO;
}

/**
 * 比赛相关 API 类型
 */
export namespace ContestAPI {
  type ListRequest = PageRequest;
  type ListResponse = PageResult<ContestVO>;
  type DetailResponse = ContestVO;
  type CreateRequest = ContestAddDTO;
  type UpdateRequest = ContestAddDTO;
}


/**
 * 排行榜单项 VO
 * 通常包含用户信息和刷题数量
 */
export interface RankItemVO {
  userId: string;       // 用户ID（雪花算法）
  nickname: string;     // 昵称
  avatar: string;       // 头像地址
  acceptedCount: number;  // 通过题目数 (或者叫 score)
  rank?: number;        // 排名 (前端计算或后端返回)
}

// ✅ 新增：竞赛查询请求 DTO (对应 ContestQueryRequest.java)
export interface ContestQueryRequest extends PageRequest {
  keyword?: string;       // 关键词搜索(标题)
  status?: number;        // 状态筛选：0-未开始 1-进行中 2-已结束
}

/**
 * 比赛题目 VO (对应 ContestProblemVO.java)
 */
export interface ContestProblemVO {
  id: string;           // 关联ID
  contestId: string;    // 比赛ID
  problemId: string;    // 题目ID
  displayId: string;    // 展示序号 A, B, C
  title: string;        // 题目标题
  difficulty: number;   // 难度
}

/**
 * 比赛排行榜 VO (对应 ContestRankVO.java)
 */
export interface ContestRankVO {
  userId: string;
  nickname: string;
  avatar: string;
  rank: number;         // 排名
  totalScore: number;   // 总分
  // 题目得分详情: key是problemId, value是得分
  problemScores: Record<string, number>; 
}

/**
 * 用户注册请求参数类型
 */
export interface UserRegisterRequest {
  userAccount: string
  password: string
  checkPassword: string
}