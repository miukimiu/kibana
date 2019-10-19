/*eslint-disable */
export const inputIndices = JSON.parse('{"test":{"shards":[{"id":["F-R7QxH4S42fMnPfmFUKMQ","test","0"],"searches":[{"query":null,"rewrite_time":2656,"collector":[{"name":"MultiCollector","reason":"search_multi","time":"0.1815780000ms","children":[{"name":"SimpleTopScoreDocCollector","reason":"search_top_hits","time":"0.02393700000ms"},{"name":"ProfilingAggregator: [org.elasticsearch.search.profile.aggregation.ProfilingAggregator@43c8a536]","reason":"aggregation","time":"0.1140000000ms"}]}],"flat":[{"id":"af697413-f76b-458e-b265-f4930dbdee2a","childrenIds":[],"lucene":"name:george","time":0.219343,"selfTime":0.219343,"timePercentage":"100.00","query_type":"TermQuery","absoluteColor":"#ffafaf","depth":0,"breakdown":[{"key":"create_weight","time":160673,"relative":"73.3","color":"#fcc2c2","tip":"The time taken to create the Weight object, which holds temporary information during scoring."},{"key":"build_scorer","time":50157,"relative":"22.9","color":"#f7e5e5","tip":"The time taken to create the Scoring object, which is later used to execute the actual scoring of each doc."},{"key":"score","time":5783,"relative":"2.6","color":"#f5f3f3","tip":"The time taken in actually scoring the document against the query."},{"key":"next_doc","time":2718,"relative":"1.2","color":"#f5f4f4","tip":"The time taken to advance the iterator to the next matching document."},{"key":"build_scorer_count","time":5,"relative":0,"color":"#f5f5f5","tip":""},{"key":"next_doc_count","time":4,"relative":0,"color":"#f5f5f5","tip":""},{"key":"score_count","time":2,"relative":0,"color":"#f5f5f5","tip":""},{"key":"create_weight_count","time":1,"relative":0,"color":"#f5f5f5","tip":""},{"key":"match","time":0,"relative":"0.0","color":"#f5f5f5","tip":"The time taken to execute a secondary, more precise scoring phase (used by phrase queries)."},{"key":"match_count","time":0,"relative":0,"color":"#f5f5f5","tip":""},{"key":"advance","time":0,"relative":"0.0","color":"#f5f5f5","tip":"The time taken to advance the iterator to the next document."},{"key":"advance_count","time":0,"relative":0,"color":"#f5f5f5","tip":""}]}]}],"aggregations":[{"type":"org.elasticsearch.search.aggregations.metrics.stats.StatsAggregator","description":"stats","time":"0.03053500000ms","breakdown":{"reduce":0,"build_aggregation":9447,"build_aggregation_count":1,"initialize":5589,"initialize_count":1,"reduce_count":0,"collect":15495,"collect_count":2}}],"time":0.219343,"color":0,"relative":0,"rewrite_time":2656}],"time":0.219343,"name":"test"}}');

export const normalizedIndices = JSON.parse('[{"shards":[{"id":["F-R7QxH4S42fMnPfmFUKMQ","test","0"],"searches":[{"query":null,"rewrite_time":2656,"collector":[{"name":"MultiCollector","reason":"search_multi","time":"0.1815780000ms","children":[{"name":"SimpleTopScoreDocCollector","reason":"search_top_hits","time":"0.02393700000ms"},{"name":"ProfilingAggregator: [org.elasticsearch.search.profile.aggregation.ProfilingAggregator@43c8a536]","reason":"aggregation","time":"0.1140000000ms"}]}],"flat":[{"id":"af697413-f76b-458e-b265-f4930dbdee2a","childrenIds":[],"lucene":"name:george","time":0.219343,"selfTime":0.219343,"timePercentage":"100.00","query_type":"TermQuery","absoluteColor":"#ffafaf","depth":0,"breakdown":[{"key":"create_weight","time":160673,"relative":"73.3","color":"#fcc2c2","tip":"The time taken to create the Weight object, which holds temporary information during scoring."},{"key":"build_scorer","time":50157,"relative":"22.9","color":"#f7e5e5","tip":"The time taken to create the Scoring object, which is later used to execute the actual scoring of each doc."},{"key":"score","time":5783,"relative":"2.6","color":"#f5f3f3","tip":"The time taken in actually scoring the document against the query."},{"key":"next_doc","time":2718,"relative":"1.2","color":"#f5f4f4","tip":"The time taken to advance the iterator to the next matching document."},{"key":"build_scorer_count","time":5,"relative":0,"color":"#f5f5f5","tip":""},{"key":"next_doc_count","time":4,"relative":0,"color":"#f5f5f5","tip":""},{"key":"score_count","time":2,"relative":0,"color":"#f5f5f5","tip":""},{"key":"create_weight_count","time":1,"relative":0,"color":"#f5f5f5","tip":""},{"key":"match","time":0,"relative":"0.0","color":"#f5f5f5","tip":"The time taken to execute a secondary, more precise scoring phase (used by phrase queries)."},{"key":"match_count","time":0,"relative":0,"color":"#f5f5f5","tip":""},{"key":"advance","time":0,"relative":"0.0","color":"#f5f5f5","tip":"The time taken to advance the iterator to the next document."},{"key":"advance_count","time":0,"relative":0,"color":"#f5f5f5","tip":""}]}]}],"aggregations":[{"type":"org.elasticsearch.search.aggregations.metrics.stats.StatsAggregator","description":"stats","time":"0.03053500000ms","breakdown":{"reduce":0,"build_aggregation":9447,"build_aggregation_count":1,"initialize":5589,"initialize_count":1,"reduce_count":0,"collect":15495,"collect_count":2}}],"time":0.219343,"color":"#ffafaf","relative":"100.00","rewrite_time":2656}],"time":0.219343,"name":"test"}]');
