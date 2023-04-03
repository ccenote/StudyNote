# 微服务

微服务是一种经过良好架构设计的分布式架构方案，微服务架构特征：

- 单一职责：微服务拆分粒度更小，每一个服务都对应唯一的业务能力，做到单一职责，避免重复业务开发
- 面向服务：微服务对外暴露业务接口
- 自治：团队独立、技术独立、数据独立、部署独立
- 隔离性强：服务调用做好隔离、容错、降级，避免出现级联问题

## RestTemplate

RestTemplate是一个HTTP请求工具，它提供了常见的REST请求方案的模板，它继承了InterceptionHttpAccessor并且实现了RestOperations接口，其中RestOperations接口定义了基本的RESTful操作，这些操作在RestTemplate中都得到了实现。

``` java
RestTemplate restTemplate = new RestTemplate();
restTemplate.postForObject(url,requestParams,ResponseBean.class);
```

这三个参数分别代表：请求地址、请求参数、HTTP响应被转换的对象类型
