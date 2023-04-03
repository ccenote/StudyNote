# Ribbon负债均衡

## Ribbon的负载均衡规则

`Ribbon`的负载均衡规则是一个叫`IRule`接口来定义的，每一个子接口都是一种规则

1. `RoundRobinRule` 简单的轮询服务列表来选择服务器，他是`Ribbon`默认的负载均衡规则
2. `AvailabilityFilteringRule` 对以下服务器进行忽略
   1. 在默认情况下，这台服务器如果3次连接失败，这台服务器就会被设置为“短路”状态。短路状态 将持续30秒，如果再次连接失败，短路的持续时间就会几何级地增加。
   2. 并发数过高的服务器。如果一个服务器的并发连接数过高，配置了`AvailabilityFilteringRule`规则的 客户端也会将其忽略。并发连接数的上限，可以由客户端的`<clientName>.<clientConfigNameSpace>. ActiveConnectionsLimit`属性进行配置。

3. `WeightedResponseTimeRule` 为每一个服务器赋予一个权重值。服务器响应时间越长，这个服务器的权重就越小。这个规则会随机选择 服务器，这个权重值会影响服务器的选择。

4. `ZoneAvoidanceRule` 以区域可用的服务器为基础进行服务器的选择。使用`Zone`对服务器进行分类，这个`Zone`可以理解为一个 机房、一个机架等。而后再对`Zone`内的多个服务做轮询。
5. `RandomRule` 随机选择一个可用的服务器

## 负载均衡定义

1. 在子服务中的启动类中定义一个`IRule`

   ``` java
   @Bean
   public IRule randomRule(){
       return new RandomRule();
   }
   ```

2. 在配置文件中可以通过添加配置来定义规则

   ``` yaml
   userservice:
   	ribbon:
   		NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule
   ```

## Ribbon加载方式

`Ribbon`默认是采用懒加载，即第一次访问时才会去创建`LoadBalanceClient`，请求时间会很长。而饥饿加载则会在项目启动时创建，降低第一次访问的耗时，通过下面配置开启饥饿加载：

``` yaml
ribbon:
	eager-load:
		enabled: true
		clients: userservice
```
