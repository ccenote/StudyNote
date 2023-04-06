# Eureka

## Eureka的作用

- 服务提供者启动时向`eureka`注册自己的信息

- 消费者根据服务名称向`eureka`拉取提供者信息

- 当有多个服务提供者时，服务消费者利用负载均衡算法，从服务列表中挑选一个

- 消费者如何感知服务提供者的健康状态
  - 服务提供者会每隔`30`秒向`EurekaServer`发送心跳请求，报告健康状态
    - `eureka`会更新记录服务列表信息，心跳不正常会被剔除
    - 消费者就可以拉去到最新的信息

## Eureka架构中的角色

- `EurekaServer`：服务端，注册中心
  - 记录服务信息
  - 心跳监控

- `EurekaClient`：客户端
  - `Provider`：服务提供者
    - 注册自己的信息到`EurekaServer`
    - 每隔`30`秒向`EurekaServer`发送心跳
    - `consumer`：服务消费者
      - 根据服务名称从`EurekaServer`拉取服务列表
      - 基于服务列表做负载均衡，选中一个微服务后发起远程调用

## 搭建EurekaServer服务

1. 创建项目，引入`spring-cloud-starter-netflix-eureka-server`的依赖

2. 编写启动类，添加`@EnableEurekaServer`注解

3. 添加`application.yml`文件，编写配置

   ``` yaml
   server:
   	port: 10086
   spring:
   	application: 
   		name: eurekaserver
   eureka: 
   	client:
   		service-url:
   			defaultZone: http://127.0.0.1:10086/eureka/
   ```

1. 注册服务到`EurekaServer`

   1. 在项目中引入`spring-cloud-starter-netflix-eureka-client`的依赖

   2. 在`application.yml`文件，编写配置

      ``` yaml
      spring:
      	application:
      		name: userservice
      eureka:
      	client:
      		service-url:
      			defaultZone: http://127.0.0.1:10086/eureka/
      ```

   3. 服务拉取

      ``` java
      String url="http://userservice/user/"+order.getUserId();
      ```

   4. 在启动类中为`RestTemplate`添加负载均衡注解：

      ``` java
      @Bean
      @LoadBalanced
      public RestTemplate restTemplate(){
          return new RestTemplate();
      }
      ```