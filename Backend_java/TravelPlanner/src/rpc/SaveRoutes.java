package rpc;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import db.DBConnection;
import db.DBConnectionFactory;
import entity.Place;
import external.JwtUtil;

/**
 * Servlet implementation class SaveRoutes
 */
@WebServlet("/saveroutes")
public class SaveRoutes extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SaveRoutes() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
//	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//		// TODO Auto-generated method stub
//		response.getWriter().append("Served at: ").append(request.getContextPath());
//	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		DBConnection connection = DBConnectionFactory.getConnection();

		//check token
		if(RpcHelper.checkToken(request, response)==null) {
			return;
		}
		
		try {
			JSONObject input = RpcHelper.readJSONObject(request);
			JSONArray  array = input.getJSONArray("results");
			int ith = input.getInt("ithDay");
			String userId = input.getString("user_id");
			List<Place> places = RpcHelper.parseArray(array);
			JSONObject obj = new JSONObject();
			
			if(connection.saveRoutes(places, userId, ith)) {
				obj.put("status", "OK");
			}else {
				obj.put("status", "failed to write to Collection routes");
			}
			RpcHelper.writeJsonObject(response, obj);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}finally {
			connection.close();
		}
		
	}
	
	
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
		DBConnection connection = DBConnectionFactory.getConnection();
		JSONObject obj = new JSONObject();
		System.out.println("in delete" + RpcHelper.checkToken(request, response));
		if(RpcHelper.checkToken(request, response) == null) {
			return;
		}
		
		try {
			JSONObject input = RpcHelper.readJSONObject(request);
			String userId = input.getString("user_id");
			int ith = input.getInt("ithDay");
			if(connection.unsaveRoutes(userId, ith)) {
				obj.put("status", "OK");
			}else {
				obj.put("status", "failed to delete the Document");
			}
			RpcHelper.writeJsonObject(response, obj);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		
	}
	
	

}
