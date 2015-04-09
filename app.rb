#encoding : utf-8

require './config'
require './router'

EM.run {
	@channel = EM::Channel.new
	arr = []
	begin
		data_server = TCPSocket.new($bsip, $bsport)
	rescue Exception => e
		puts "30003 connected failed !"
	end

	read_tcp_data = proc do
		while line = data_server.gets
			arr << line.chop
			puts "size: #{arr.size}"
		end
	end

	EM::WebSocket.run(:host=> '127.0.0.1', :port=>8888) do |ws|
		timer = nil
		ws.onopen { |handshake|
			sid = @channel.subscribe { |msg| ws.send msg }
      		puts "#{sid} connected!"
			
			timer = EM.add_periodic_timer(0.1) {
			  str = ''
			  while arr.size > 0 do
			  	str << arr.shift + ";"
			  end

			  puts str
			  if str.size > 0
			  	@channel.push(str)
			  end
			}

			ws.onclose { @channel.unsubscribe(sid)}

			ws.onmessage do |msg|
				puts "reveive msg #{msg}"
				#ws.send "reply msg "
			end
		}
	end

	EM.defer(read_tcp_data)
	WebApp.run!({:port => 3000})

	trap("INT") do
	    puts "Stop all service ..."
	    EventMachine.stop
	end
}