var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["subject.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}

function fakeDemo()
{
	console.log( faker.phone.phoneNumber() );
	console.log( faker.phone.phoneNumberFormat() );
	console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
		}
	}
};

function generateTestCases()
{

	var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";
	for ( var funcName in functionConstraints )
	{

		//console.log(functionConstraints);
		var params = {};
		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = '\'\'';
		}

		//console.log( params );
		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });

	// plug-in values for parameters
		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			if( params.hasOwnProperty( constraint.ident ) )
			{
				params[constraint.ident] = constraint.value;
			}
		}

		// Prepare function arguments.
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
		var temp_argument = args.split(",");
		
		// New arguments
		// Set of arguments.
		var arg_1 = [];
		var arg_2 = [];
		var arg_3 = [];
		var arg_4 = [];
		var arg_5 = [];
		var arg_6 = [];
		for(var i=0; i<temp_argument.length;i++){

			if(!isNaN(temp_argument[i])){
				var t_var = parseInt(temp_argument[i]);
				arg_1.push(-t_var);
			}
			else{
				arg_1.push(temp_argument[i]);
			}
		}

		//2
		for(var i=0; i<temp_argument.length;i++){

			if(!isNaN(temp_argument[i])){
				var t_var = parseInt(temp_argument[i]);
				arg_2.push(t_var);
			}
			else{

				arg_2.push('"NotStrict"');
			}
		}




		for(var i=0; i<temp_argument.length;i++){

			if(!isNaN(temp_argument[i])){
				var t_var = parseInt(temp_argument[i]);
				arg_3.push(-t_var);
			}
			else{
				
				arg_3.push('"NotStrict_original_param"');
			}
		}

		for(var i=0; i<temp_argument.length;i++){

			if(!isNaN(temp_argument[i])){
				var t_var = parseInt(temp_argument[i]);
				var big_number = t_var;
				arg_4.push(t_var * big_number);
			}
			else{
				
					arg_4.push(temp_argument[i]);
			}
		}

			

		for(var i=0; i<temp_argument.length;i++){

			if(!isNaN(temp_argument[i])){
				var t_var = parseInt(temp_argument[i]);
				arg_5.push(t_var * t_var);
			}
			else{
					arg_5.push('"Big_o"');
			}
		}



		for(var i=0; i<temp_argument.length;i++){

			if(!isNaN(temp_argument[i])){
				var t_var = parseInt(temp_argument[i]);
				arg_6.push(-t_var);
			}
			else{
					arg_6.push('"werw"');
			}
		}

		
		if( pathExists || fileWithContent )
		{
			content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
			// Bonus...generate constraint variations test cases....
			content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);
			content += generateMockFsTestCases(pathExists,!fileWithContent,funcName, args);
			content += generateMockFsTestCases(!pathExists,!fileWithContent,funcName, args);
		}
		else
		{
			// Emit simple test case.
			content += "subject.{0}({1});\n".format(funcName, args );
			content += "subject.{0}({1});\n".format(funcName, arg_1.join(","));
			content += "subject.{0}({1});\n".format(funcName, arg_2.join(","));
			content += "subject.{0}({1});\n".format(funcName, arg_3.join(","));
			content += "subject.{0}({1});\n".format(funcName, arg_4.join(","));
			content += "subject.{0}({1});\n".format(funcName, arg_5.join(","));
			content += "subject.{0}({1});\n".format(funcName, arg_6.join(","));

		}

	}

	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestCases (pathExists,fileWithContent,funcName,args) 
{
	var testCase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}

	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsubject.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			

//			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			
			traverse(node, function(child)
			{


			
				if( child.type === 'BinaryExpression' && child.operator == "==")
				{
					
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{

						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}

						));


					}


					if(child.type=== 'BinaryExpression' && child.left.name == "area"){

					//console.log(buf.substring(child.range[0], child.range[1]));
					var expression = buf.substring(child.range[0], child.range[1]);
					var rightHand = buf.substring(child.right.range[0], child.right.range[1]);
					var fake_number = '"' + "(" + String(child.right.value) + ")" + " " + "555-5555" + '"';
                  //  var fake_number_2 = '"' + "(" + (parseInt(child.right.value) + 1) + ")" + " " + "888-8888" + '"';

					functionConstraints[funcName].constraints.push(

							new Constraint({
									ident:params[0],
									value:fake_number,
									funcName: funcName,
                                	kind: "integer",
                                	operator: child.operator,
                                	expression: expression

							})

							);


//					console.log(child.left.name);

					}

				if(child.type === 'BinaryExpression' && child.left.type =="CallExpression" ){

									
							//var rightHand = child.left.;	
							var expression = buf.substring(child.range[0], child.range[1]);
							var rightHand = buf.substring(child.right.range[0], child.right.range[1])


							console.log(rightHand);	
							functionConstraints[funcName].constraints.push(

								new Constraint({
								ident: child.left.callee.object.name,
								value:'"strict"',
								funcName: funcName,
                                kind: "string",
                                operator: child.operator,
                                expression: expression

							}));

							console.log(functionConstraints[funcName].constraints);

				}					


				}


				if( child.type === 'BinaryExpression' && child.operator == "<")
				{
					
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{

						//console.log(params)
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						
			functionConstraints[funcName].constraints.push( 
							new Constraint(					

							{
								ident: child.left.name,
								value: rightHand-1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression

							}
						)


						);


					}


				}


				if( child.type === 'BinaryExpression' && child.operator == ">")
				{
					
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{

						//console.log(params)
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					
					}
					
				}

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="existsSync")
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								// A fake path to a file
								value:  "'path/fileExists'",
								funcName: funcName,
								kind: "fileExists",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

			});
	
			/*if(funcName == "blackListNumber")	
			console.log(functionConstraints[funcName]);*/
			//console.log( functionConstraints[funcName]); 

		}
	});
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
