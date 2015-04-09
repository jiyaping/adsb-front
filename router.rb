class WebApp < Sinatra::Base
	get '/' do
		erb :index
	end
end