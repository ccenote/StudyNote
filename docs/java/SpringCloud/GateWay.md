# 统一网关GateWay

## 网关功能

- 身份认证和权限校验

- 服务路由、负载均衡

- 请求限流

## 网关的技术实现

在SpringClould中网关的实现包括两种：

- gateway
- zuul

Zuul是基于Servlet的实现，属于阻塞式编程。而SpringCloudGateway则是基于Spring5中提供的WebFlux，属于响应式编程的实现，具备更好的性能。

## 搭建网关服务的步骤

1. 创建新的module，引入`spring-cloud-starter-gateway` 的依赖和`nacos`的服务发现依赖：

2. 编写路由配置及nacos地址

   ``` yaml
   server:
   	port: 10010 #网关端口
   spring:
   	application:
   		name: gateway #服务名称
   	cloud:
   		nacos:
   			server-addr: localhost:8848 #nacos地址
   		gateway:
   			routes: #网关路由配置
   				-id: user-service #路由id,自定义，只要唯一即可
   				 uri: lb://userservice #路由的目标地址lb就是负债均衡，后面跟服务名称
   				 predicates: #路由断言，也就是判断请求是否符合路由规则的条件
   				 	-Path=/user/** #这个是按照路径匹配，只要以/user/开头就符合要求
   ```

网关路由可以配置的内容包括：

1. 路由Id:路由唯一标示
2. uri:路由目的地，支持lb和http两种
3. predicates:路由断言，判断请求是否符合要求，符合则转发到路由目的地
4. filters：路由过滤器，处理请求或响应

## 路由断言

我们在配置文件中写的断言规则只是字符串，这些字符串会被`Predicate Factory`读取并处理，转变为路由判断的条件

像这样的断言工厂在SpringCloudGateway还有很多

## 过滤器工厂

Spring提供了31中不同路由过滤器工厂，例如：

| 名称                 | 说明                       |
| -------------------- | -------------------------- |
| AddRequestHeader     | 给当前请求添加一个请求头   |
| RemoveRequestHeader  | 移除请求中的一个请求头     |
| AddResponseHeader    | 给响应结果中添加一个响应头 |
| RemoveResponseHeader | 从响应结果中移除一个响应头 |
| RequestRateLimiter   | 限制请求的流量             |

给所有进入子服务userservice的请求添加一个请求头：Truth=hello,world

实现方式：

``` yaml
spring:
	cloud:
		gateway:
	routes:
		-id: user-service
		 uri: lb://userservice
		 predicates: 
		 	-Path=/User/**
		 filters: #如果对所有的路由请求都生效可以写成default-filters
		 	-AddRequestHeader=Truth,hello,world
```

## 全局过滤器GlobalFilter

全局过滤器的作用也是处理一切进入网关的请求和微服务响应，与GatewayFilter的作用一样。

区别在于GatewayFilter通过配置定义，处理逻辑是固定的。而GlobalFilter的逻辑需要自己写代码实现

定义方式是实现GlobalFilter接口

``` java
public interface GlobalFilter{
    Mono<Void> filter(ServerWebExchange exchange,GatewayFilterChain chain);
}
```

自定义类，实现GlobalFilter接口，添加`@Order`注解：

``` java
@Order(-1)
@Component
public class AuthorizeFilter implements GlobalFilter{
    @Override
    public Movo<Void> filter(ServerWebExchange exchange,GatewayFilterChain chain){
        MultiValueMap<String,String> params=exchange.getRequest().getQueryParams();
        String auth=params,getFirst("authorization");
        if("admin".equals(auth)){
            return chain.filter(exchange);
        }
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
```

过滤器执行顺序

- 每一个过滤器都必须指定一个Int类型的order值，order值越小，优先级越高，执行顺序越靠前
- GlobalFilter通过实现Ordered接口，或者添加@Order注解来指定order值
- 路由过滤器和`defaultFilter`的order 由Spring指定，默认是按照声明顺序从1递增
- 当过滤器的order值一样时，会按照defaultFilter > 路由过滤器 > GlobalFilter的顺序执行

## 跨域问题处理

网关处理跨域采用的同样是CORS方案，并且只需要简单配置即可实现：

``` yaml
spring:
	cloud:
		gateway:
			globalcors: #全局跨域处理
				add-to-simple-url-handler-mapping: true #解决options请求被拦截问题
				corsConfiguration:
					'[/**]':
						allowedOrigins: #允许那些网站的跨域请求
							- "http://localhost:8890"
							- "http://localhost:8891"
                          allowedMethods: #允许的跨域ajax的请求方式
                          	  - "GET"
                          	  - "POST"
                          	  - "PUT"
                          	  - "DELETE"
                          allowedHeaders: "*" #允许在请求中携带头信息
                          	allowCredentials: true #是否允许携带cookie
                          maxAge: 360000 #这次跨域检测的有效期
```