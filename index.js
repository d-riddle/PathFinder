onload = function () {
    var curr_data,V,src,dest;

    // Linking the required html element with script.js
    var container_que_graph = document.getElementById('mynetwork1');
    var container_sol_graph = document.getElementById('mynetwork2');
    var genNew = document.getElementById('anothergraph');
    var solve = document.getElementById('solve');
    var beforetext= document.getElementById('beforetext');
    var aftertext= document.getElementById('aftertext');
    var cities = ['Ranchi', 'Bhubneswar', 'Delhi', 'Hyderabad', 'Kolkata', 'Chennai', 'Agra', 'Bangalore', 'Coimbatore', 'Puducherry'];

    // Styling the Nodes and the edges of the graph.
    var options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12px arial red',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf015',
                size: 40,
                color: '#991133',
            }
        }
    };

    // Initialize your network!
    // Network for question graph
    var network_que_graph = new vis.Network(container_que_graph);
    network_que_graph.setOptions(options);
    // Network for result graph
    var network_sol_graph = new vis.Network(container_sol_graph);
    network_sol_graph.setOptions(options);

    function createGraphData(){
        V = Math.floor(Math.random() * 8) + 3; // Ensures V is between 3 and 10
        var nodes = [];
        for(var i=1;i<=V;i++){
            nodes.push({id:i, label: cities[i-1]})
        }
        // Prepares vis.js style nodes for our data
        nodes = new vis.DataSet(nodes);

        // Creating a tree like underlying graph structure
        var edges = [];
        for(var i=2;i<=V;i++){
            var neighbour = i - Math.floor(Math.random()*Math.min(i-1,3)+1); // Picks a neighbour from i-3 to i-1
            edges.push({type: 0, from: i, to: neighbour, color: 'orange',label: String(Math.floor(Math.random()*70)+31)});
        }

        // Randomly adding new edges to graph
        // Type of bus is 0
        // Type of train is 1
        var i=1;
        while(i<=V/2){

            var num1 = Math.floor(Math.random()*V)+1;
            var num2 = Math.floor(Math.random()*V)+1;
            if(num1!==num2){
                if(num1<num2){
                    var temp = num1;
                    num1 = num2;
                    num2 = temp;
                }
                // Seeing if an edge between these two vertices already exists
                // And if it does then of which kind
                var flag = 0;
                for(var j=0;j<edges.length;j++){
                    if(edges[j]['from']===num1 && edges[j]['to']===num2) {
                        if(edges[j]['type']===0)
                            flag = 1;
                        else 
                            flag = 2;
                    }
                }

                // Adding edges to the graph
                // If flag == 0, you can add bus as well as train between vertices.
                // If flag == 1, you can only add train between them.
                if(flag <= 1) {
                    if (flag === 0 && i < V / 4) {
                        // Adding a bus
                        edges.push({
                            type: 0,
                            from: num1,
                            to: num2,
                            color: 'orange',
                            label: String(Math.floor(Math.random() * 70) + 31)
                        });
                    } else {
                        // Adding a train
                        edges.push({
                            type: 1,
                            from: num1,
                            to: num2,
                            color: 'green',
                            label: String(Math.floor(Math.random() * 50) + 1)
                        });
                    }
                    i++;
                }
            }
        }

        // Setting the new values of global variables
        src = 1;
        dest = V;
        curr_data = {
            nodes: nodes,
            edges: edges
        };
    }

    genNew.onclick = function () {
        // Create new data and display the data
        createGraphData();
        network_que_graph.setData(curr_data);
        aftertext.innerText = 'Find least time path from '+cities[src-1]+' to '+cities[dest-1];
        beforetext.style.display = "inline";
        aftertext.style.display = "inline";
        container_sol_graph.style.display = "none";

    };

    solve.onclick = function () {
        // Create graph from data and set to display
        beforetext.style.display  = "none";
        aftertext.style.display  = "none";
        container_sol_graph.style.display = "inline";
        network_sol_graph.setData(solveData());
    };

    function buildGraph(data){
        var adj = [];
        for(var i=1;i<=V;i++){
            adj.push([]);
        }

        for(var i=0;i<data['edges'].length;i++) {
            var edge = data['edges'][i];
            adj[edge['to']-1].push([edge['from']-1,parseInt(edge['label']),edge['type']]);
            adj[edge['from']-1].push([edge['to']-1,parseInt(edge['label']),edge['type']]);
        }
        return adj;
    }

    function djikstra(graph, n_of_ver, src) {
        var visited = Array(n_of_ver).fill(0);
        var dist = [];
        for(var i=1;i<=n_of_ver;i++)
            dist.push([100000,-1,-1]);
        dist[src][0] = 0;

        for(var i=0;i<n_of_ver-1;i++){
            var minpos = -1;
            var mn=100000;
            for(var j=0;j<n_of_ver;j++){
                if(visited[j]===0&&dist[j][0]<mn){
                    mn=dist[j][0];
                    minpos=j;
                }
            }

            visited[minpos] = 1;
            for(var j in graph[minpos]){
                var edge = graph[minpos][j];
                if(visited[edge[0]]===0 && dist[edge[0]][0]>dist[minpos][0]+edge[1]){
                    dist[edge[0]][0] = dist[minpos][0]+edge[1];
                    dist[edge[0]][1] = minpos;
                    dist[edge[0]][2]=edge[2];
                }
            }
        }

        return dist;
    }

    function solveData() {

        var data = curr_data;

        // Creating adjacency list matrix graph from question data
        var adj = buildGraph(data);

        // Applying djikstra from src and dst
        var dist = djikstra(adj,V,src-1);


        var sol_edges = [];
        var curr=dest-1;
        while(dist[curr][0]!==0)
        {
            var par=dist[curr][1];
            var flag=dist[curr][2];
            //console.log(par);
            if(flag===0)
                sol_edges.push({arrows: { to: { enabled: true}},from: par+1, to: curr+1, color: 'orange', label: String(dist[curr][0] - dist[par][0])});
            else 
                sol_edges.push({arrows: { to: { enabled: true}},from: par+1, to: curr+1, color: 'green', label: String(dist[curr][0] - dist[par][0])});
            curr=par;
        }
        sol_edges=new vis.DataSet(sol_edges);
        var sol_data = {
            nodes: data['nodes'],
            edges: sol_edges
        };
        return sol_data;
    }
    genNew.click();
};







