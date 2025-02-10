d3.json("employment_vs_dengue.json").then(function(data) {
    const margin = {top: 40, right: 20, bottom: 50, left: 60};
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const municipalities = d3.groups(data, d => d.Municipality);
    
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Cases)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(municipalities.map(d => d[0]));

    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Cases));

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("font-size", "12px");

    const lines = svg.selectAll(".line")
        .data(municipalities)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => color(d[0]))
        .attr("stroke-width", 4)
        .attr("d", d => line(d[1]))
        .on("mouseover", function(event, d) {
            d3.selectAll(".line")
                .attr("stroke-opacity", 0.2); 
            d3.select(this)
                .attr("stroke-opacity", 1); 
            
            tooltip.style("visibility", "visible")
                .text(d[0]); 
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            d3.selectAll(".line")
                .attr("stroke-opacity", 1);
            tooltip.style("visibility", "hidden");
        })
        .on("click", function(event, d) {
            d3.selectAll(".line")
                .style("display", "none");

            d3.select(this)
                .style("display", "inline");

            const clickedMunicipalityData = d[1];

            y.domain([0, d3.max(clickedMunicipalityData, d => d.Cases)])
                .nice();

            svg.select(".y-axis")
                .transition()
                .duration(500)
                .call(d3.axisLeft(y));

            d3.select(this)
                .transition()
                .duration(500)
                .attr("d", line(clickedMunicipalityData));

            const xDomain = d3.extent(clickedMunicipalityData, d => d.Year);
            x.domain(xDomain);

            svg.select(".x-axis")
                .transition()
                .duration(500)
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));
        });

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.on("dblclick", function() {
        d3.selectAll(".line")
            .style("display", "inline");

        y.domain([0, d3.max(data, d => d.cases)])
            .nice();

        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y));

        const xDomain = d3.extent(data, d => d.employment);
        x.domain(xDomain);

        svg.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        lines.transition()
            .duration(500)
            .attr("d", function(d) {
                return line(d[1]);
            });
    });
});