// 通用响应结构，对应 Java 的 Result<T>
export interface Result<T = any> {
  code: number;      // 状态码，例如 200 为成功
  message: string;   // 响应信息
  data: T;           // 具体数据
}

// 分页响应结构，对应 Java 的 Page<T>
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}